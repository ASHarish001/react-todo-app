// import { useState, useEffect } from 'react'
// import { 
//   TextField,
//   Button, 
//   List, 
//   ListItem, 
//   ListItemText, 
//   IconButton,
//   Container,
//   Typography,
//   Stack
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';

// function App() {
//   const [tasks, setTasks] = useState([]);
//   const [newTask, setNewTask] = useState('');

//   // Fetch tasks from Firestore
//   const fetchTodos = async () => {
//     try {
//       const snapshot = await getDocs(collection(db, 'tasks'));

//       const todos = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));

//       // setTasks(todos.map(todo => todo.text));
//       setTasks(todos);
//     } catch (error) {
//       console.error('Error fetching todos:', error);
//     }
//   };

//   // Run when app loads
//   useEffect(() => {
//     fetchTodos();
//   }, []);

//   // Add task to Firestore
//   const addTodo = async () => {
//     if (newTask.trim() !== '') {
//       try {
//         await addDoc(collection(db, 'tasks'), {
//           text: newTask,
//           timestamp: new Date()
//         });

//         fetchTodos();
//         setTasks([...tasks, newTask]);
//         setNewTask('');
//       } catch (error) {
//         console.error('Error adding task:', error);
//       }
//     }
//   };

//   const deleteTodo = async (index) => {
//     try {
//       await deleteDoc(doc(db, 'tasks', tasks[index].id));
//       setTasks(tasks.filter((_, i) => i !== index));
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     }
//   };

//   return (
//     <>
//       <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           Task Reminder
//         </Typography>

//         <Container maxWidth="sm" sx={{ mt: 4 }}>
//           <Stack spacing={2} direction="row" alignItems="center">
//             <TextField
//               label="Add Task"
//               variant="outlined"
//               fullWidth
//               value={newTask}
//               onChange={e => setNewTask(e.target.value)}
//               onKeyDown={e => {
//                 if (e.key === 'Enter') addTodo();
//               }}
//               sx={{ mb: 2 }}
//             />

//             <Button
//               variant="contained"
//               color="primary"
//               onClick={addTodo}
//               sx={{ mb: 2 }}
//             >
//               <AddIcon />
//             </Button>
//           </Stack>

//           <List>
//             {tasks.length > 0 ? (
//               tasks.map((task, index) => (
//                 <ListItem
//                   key={index}
//                   secondaryAction={
//                     <IconButton
//                       edge="end"
//                       color="error"
//                       onClick={() => deleteTodo(index)}
//                     >
//                       <DeleteIcon />
//                     </IconButton>
//                   }
//                 >
//                   <ListItemText primary={`${index + 1}. ${task.text}`} />
//                 </ListItem>
//               ))
//             ) : (
//               <Typography variant="body1" align="center" color="textSecondary">
//                 No tasks added yet.
//               </Typography>
//             )}
//           </List>
//         </Container>
//       </Container>
//     </>
//   );
// }

// export default App;

import { useAuth } from "./context/AuthContext";
import GoogleLogin from "./comps/GoogleLogin";
import TodoComp from "./comps/TodoComp";

function App() {
  const { user } = useAuth();

  return (
    <div>
      {user ? <TodoComp /> : <GoogleLogin />}
    </div>
  );
}

export default App;
