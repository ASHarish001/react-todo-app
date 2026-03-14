
// function TodoList() {
//   const [tasks, setTasks] = useState([]);
//   const [newTask, setNewTask] = useState("");

//   const addTask = () => {
//     if (newTask.trim() !== "") {
//       setTasks([...tasks, newTask]);
//       setNewTask("");
//     }
//   };

//   const deleteTask = (index) => {
//     const updatedTasks = tasks.filter((_, i) => i !== index);
//     setTasks(updatedTasks);
//   };

//   const logout = async () => {
//     await signOut(auth);
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom>
//         Todo App
//       </Typography>
//       <Button onClick={logout} variant="outlined" sx={{ mb: 2 }}>
//         Logout
//       </Button>

//       <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//         <TextField
//           label="New Task"
//           value={newTask}
//           onChange={(e) => setNewTask(e.target.value)}
//         />
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={addTask}
//         >
//           Add
//         </Button>
//       </Stack>

//       <List>
//         {tasks.map((task, index) => (
//           <ListItem
//             key={index}
//             secondaryAction={
//               <IconButton edge="end" onClick={() => deleteTask(index)}>
//                 <DeleteIcon />
//               </IconButton>
//             }
//           >
//             <ListItemText primary={task} />
//           </ListItem>
//         ))}
//       </List>
//     </Container>
//   );
// }

// export default TodoList;
import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Container,
  Typography,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { collection, doc, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

function TodoComp() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // Fetch tasks from Firestore
  const fetchTodos = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users', auth.currentUser.uid, 'tasks'));

      const todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // setTasks(todos.map(todo => todo.text));
      setTasks(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Run when app loads
  useEffect(() => {
    fetchTodos();
  }, []);

  // Add task to Firestore
  const addTodo = async () => {
    if (newTask.trim() !== '') {
      try {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'tasks'), {
          text: newTask,
          timestamp: new Date()
        });

        fetchTodos();
        setTasks([...tasks, newTask]);
        setNewTask('');
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const deleteTodo = async (index) => {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', tasks[index].id));
      setTasks(tasks.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          {auth.currentUser ? `${auth.currentUser.email}'s Todo List` : 'Users Todo List'}
        </Typography>

        <Button onClick={logout} variant="outlined" sx={{ mb: 2 }}>
            Logout
        </Button>

        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <TextField
              label="Add Task"
              variant="outlined"
              fullWidth
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addTodo();
              }}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={addTodo}
              sx={{ mb: 2 }}
            >
              <AddIcon />
            </Button>
          </Stack>

          <List>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => deleteTodo(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={`${index + 1}. ${task.text}`} />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" align="center" color="textSecondary">
                No tasks added yet.
              </Typography>
            )}
          </List>
        </Container>
      </Container>
    </>
  );
}

export default TodoComp;