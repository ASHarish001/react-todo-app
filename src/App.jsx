import { useState } from 'react'
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, newTask]);
      setNewTask('');
    }
  };
  
  const deleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <>
      <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
        <Typography variant="h4" align="center" gutterBottom>
          To-Do List
        </Typography>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Stack spacing={2} direction="row" alignItems="center">
            <TextField
              label="Add Task"
              variant="outlined"
              fullWidth
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addTask();
              }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addTask}
              sx={{ mb: 2 }}
            >
              <AddIcon />
            </Button>
          </Stack>
          <List>
            {tasks.length > 0 ? (tasks.map((task, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton edge="end" color="error" onClick={() => deleteTask(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={task} />
              </ListItem>
            ))) : (
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

export default App
