import { Alert, BackHandler, FlatList, Text, ToastAndroid, View } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { useGlobalContext } from '../context/context';
import theme from '../style/theme';
import { useEffect } from 'react';
import React from 'react';
import NoteCard from './NoteCard';
import { getData, storeData } from '../utils/storage';


const Notes = ({ selectedNotes, setSelectedNotes, filteredNotes, isSearchMode, setIsSearchMode }) => {
  const { notes, setNotes } = useGlobalContext();
  const navigation = useNavigation();

  useEffect(() => {
    setSelectedNotes([]);
  }, [notes, setSelectedNotes]);


  useEffect(() => {
    const backAction = () => {
      if (selectedNotes.length > 0) {
        setSelectedNotes([]);
        return true;
      }
      if (isSearchMode) {
        setIsSearchMode(false);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, [selectedNotes, setSelectedNotes, isSearchMode, setIsSearchMode]);


  const handlePress = (id) => {
    if (selectedNotes.length == 0) {
      navigation.navigate("UpdateNote", { id });
    }
    else {
      if (selectedNotes.includes(id)) {
        setSelectedNotes(selectedNotes.filter(selectedNoteId => selectedNoteId !== id));
      }
      else {
        setSelectedNotes([...selectedNotes, id]);
      }
    }
  }

  const handleLongPress = (id) => {
    if (selectedNotes.includes(id)) return;
    setSelectedNotes([...selectedNotes, id]);
  }


  const moveNoteToTrash = async (noteId) => {
    try {
      const note = notes.find(note => note.id === noteId);
      const trashNotes = (await getData("trashNotes")) || [];
      const newTrashNotesArr = [...trashNotes, note];
      await storeData("trashNotes", newTrashNotesArr);

      const newNotesArr = notes.filter(note => note.id !== noteId);
      await storeData("notes", newNotesArr);
      setNotes(newNotesArr);
      ToastAndroid.show("Note moved to trash", ToastAndroid.SHORT);
    }
    catch (err) {
      console.log(err);
      Alert.alert("Error", "Some error is there!!");
    }
  }


  const getFlatList = notes => {
    const notesCopy = [...notes.filter(note => note.isPinned), ...notes.filter(note => !note.isPinned)];
    return <FlatList
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 200 }}
      data={notesCopy}
      keyExtractor={note => note.id}
      renderItem={({ item: note }) => <NoteCard {...{ note, handlePress, handleLongPress, moveNoteToTrash }} isAddedInSelection={selectedNotes.includes(note.id)} />}
    />
  }


  return (
    <View>

      {notes.length === 0 && (
        <View style={{ marginTop: 200, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 16 }}>
            No note.. Tap + icon to add new note
          </Text>
        </View>
      )}

      {notes.length > 0 && (
        <>
          {!isSearchMode ? (
            <>
              <Text style={{ color: theme.PRIMARY_COLOR, fontWeight: "600", fontSize: 15, paddingHorizontal: 10, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#efefef" }}>{notes.length} note{notes.length > 1 && 's'}</Text>
              {getFlatList(notes)}
            </>
          ) : (
            <>
              {filteredNotes === null ? (
                <>
                  <Text style={{ color: theme.PRIMARY_COLOR, fontWeight: "600", fontSize: 15, paddingHorizontal: 10, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#efefef" }}>{notes.length} note{notes.length > 1 && 's'}</Text>
                  {getFlatList(notes)}
                </>
              ) : filteredNotes.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20, fontSize: 18, color: "#888" }}>No note found..</Text>
              ) : (
                <>
                  <Text style={{ color: theme.PRIMARY_COLOR, paddingHorizontal: 10, paddingVertical: 20 }}>{filteredNotes.length} note{filteredNotes.length > 1 && 's'} found</Text>
                  {getFlatList(filteredNotes)}
                </>
              )}
            </>
          )}
        </>
      )}

    </View>
  )
}

export default Notes