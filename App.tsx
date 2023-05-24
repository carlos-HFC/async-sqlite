import { Feather } from "@expo/vector-icons";
import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const db = SQLite.openDatabase("tarefas.db");

type Tasks = {
  id: string;
  name: string;
  delete?(): void;
};

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<Tasks[]>([]);

  useEffect(() => {
    createTable();
    getTask();
  }, []);

  function getTask() {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tarefas ORDER BY id ASC',
        [],
        (_, res) => {
          if (res.rows.length > 0) {
            let result = [];

            for (let index = 0; index < res.rows.length; index++) {
              const item = res.rows.item(index);
              result.push({ id: item.id, name: item.name });
            }

            setTasks(result);
          }
        },
      );
    });
  }

  function createTable() {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tarefas (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(50))',
        [],
      );
    });
  }

  function addTask() {
    if (!task) {
      Alert.alert('Erro', 'Digite uma tarefa válida');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO tarefas (name) VALUES (?)',
        [task],
        (_, res) => {
          if (res.rowsAffected > 0) {
            getTask();
            setTask("");
          }
        },
      );
    });
  }

  function deleteTask(id: string) {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM tarefas WHERE id = ?',
        [id],
        (_, res) => {
          if (res.rowsAffected > 0) {
            Alert.alert('Sucesso', 'Tarefa excluída com sucesso');
            getTask();
          }
        },
        (_, err) => {
          Alert.alert("Erro");
          return false;
        },
      );
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={undefined}>
      <ScrollView>
        <View style={styles.container}>
          <StatusBar barStyle="default" />

          <View>
            <Text style={styles.headerText}>Tarefas</Text>
          </View>

          <View style={styles.form}>
            <TextInput style={styles.input} placeholder="Digite uma tarefa"
              value={task} onChangeText={setTask} onSubmitEditing={addTask} />
            <TouchableOpacity style={styles.button} onPress={addTask}>
              <Feather name="plus" color="#fff" />
            </TouchableOpacity>
          </View>

          <View>
            <FlatList
              contentContainerStyle={{ gap: 16 }}
              scrollEnabled={false}
              data={tasks}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => <List {...item} delete={() => deleteTask(item.id)} />}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function List(props: Tasks) {
  return (
    <View style={styles.list}>
      <View style={{ flexDirection: "row" }}>
        <Text style={[styles.listItem, styles.listIdx]}>{props.id} - </Text>
        <Text style={[styles.listItem, styles.listTxt]}>{props.name}</Text>
      </View>
      <View>
        <TouchableOpacity style={[styles.button, styles.delete]} onPress={props.delete}>
          <Feather name="trash" color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    gap: 32
  },
  headerText: {
    fontSize: 36,
    color: "#222",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    textAlign: "center"
  },
  form: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between"
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#222",
    width: "80%"
  },
  button: {
    backgroundColor: "#222",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  listItem: {
    fontSize: 24,
    color: "#323232"
  },
  listIdx: {
    fontWeight: "bold"
  },
  listTxt: {},
  delete: {
    backgroundColor: "red"
  }
});
