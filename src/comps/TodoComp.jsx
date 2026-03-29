import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Container,
  Typography,
  Stack,
  Box,
  Paper,
  Divider,
  Avatar,
  Chip,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  query,
  orderBy,
  updateDoc,
  writeBatch,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { updateEmail, updateProfile } from "firebase/auth";
import { db } from '../services/firebase';

function TodoComp({ mode, onToggleMode }) {
  const { logout, user } = useAuth();
  const uid = user?.uid;
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [profileName, setProfileName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setProfileName(snap.data().name || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    fetchProfile();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const ref = query(
      collection(db, "users", uid, "tasks"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const todos = snapshot.docs.map((taskDoc) => ({
        id: taskDoc.id,
        ...taskDoc.data(),
        completed: Boolean(taskDoc.data().completed)
      }));
      setTasks(todos);
    });

    return () => unsubscribe();
  }, [uid]);

  // Add task to Firestore
  const addTodo = async () => {
    if (!uid) return;
    if (newTask.trim() !== "") {
      try {
        await addDoc(collection(db, "users", uid, "tasks"), {
          text: newTask,
          completed: false,
          timestamp: new Date()
        });

        setNewTask("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const deleteTodo = async (index) => {
    if (!uid || index < 0 || !tasks[index]) return;
    try {
      await deleteDoc(doc(db, "users", uid, "tasks", tasks[index].id));
      setTasks(tasks.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (taskId, completed) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "users", uid, "tasks", taskId), {
        completed: !completed
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const clearCompleted = async () => {
    if (!uid) return;
    try {
      const completedTasks = tasks.filter((task) => task.completed);
      if (completedTasks.length === 0) return;

      const batch = writeBatch(db);
      completedTasks.forEach((task) => {
        const taskRef = doc(db, "users", uid, "tasks", task.id);
        batch.delete(taskRef);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
    }
  };

  const openProfileDialog = () => {
    setEditName(profileName || user?.displayName || "");
    setEditEmail(user?.email || "");
    setProfileError("");
    setProfileSuccess("");
    setProfileOpen(true);
  };

  const closeProfileDialog = () => {
    if (profileLoading) return;
    setProfileOpen(false);
  };

  const saveProfileChanges = async () => {
    if (!uid || !user) return;

    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();

    if (!trimmedName || !trimmedEmail) {
      setProfileError("Name and email are required.");
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      if (trimmedName !== (user.displayName || "")) {
        await updateProfile(user, { displayName: trimmedName });
      }

      if (trimmedEmail !== (user.email || "")) {
        await updateEmail(user, trimmedEmail);
      }

      await setDoc(
        doc(db, "users", uid),
        {
          name: trimmedName,
          email: trimmedEmail,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      setProfileName(trimmedName);
      setProfileSuccess("Profile updated successfully.");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setProfileError("For security, please logout and login again before changing email.");
      } else if (error.code === "auth/invalid-email") {
        setProfileError("Please enter a valid email address.");
      } else if (error.code === "auth/email-already-in-use") {
        setProfileError("This email is already in use by another account.");
      } else {
        setProfileError(error.message || "Failed to update profile.");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const displayName = profileName || user?.displayName || "User";
  const avatarFallback = displayName.slice(0, 1).toUpperCase();
  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = totalCount - completedCount;

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const taskCountLabel = `${activeCount} ${activeCount === 1 ? "task" : "tasks"} left`;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="flex-end"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <Button onClick={openProfileDialog} variant="outlined" startIcon={<ManageAccountsIcon />}>
          Profile Settings
        </Button>
        <Button onClick={logout} variant="outlined" startIcon={<LogoutIcon />}>
          Logout
        </Button>
      </Stack>

      <Paper
        elevation={8}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper"
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={user?.photoURL || ""}
                alt={displayName}
                sx={{ width: 52, height: 52, bgcolor: "primary.main" }}
              >
                {avatarFallback}
              </Avatar>
              <Box>
                <Typography variant="h4">
                  {displayName}'s Todo List
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A clean, focused list to keep your day moving.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={taskCountLabel} color="secondary" variant="outlined" />
              <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                <IconButton
                  onClick={onToggleMode}
                  color="primary"
                  size="small"
                  sx={{ bgcolor: "background.default" }}
                >
                  {mode === "light" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              label="Add Task"
              variant="outlined"
              fullWidth
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") addTodo();
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addTodo}
              startIcon={<AddIcon />}
              sx={{ px: 3 }}
            >
              Add
            </Button>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={filter}
              onChange={(_, value) => value && setFilter(value)}
              color="primary"
            >
              <ToggleButton value="all">All ({totalCount})</ToggleButton>
              <ToggleButton value="active">Active ({activeCount})</ToggleButton>
              <ToggleButton value="completed">Done ({completedCount})</ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ minWidth: 140, textAlign: "right" }}>
              {completedCount > 0 && (
                <Button variant="text" color="error" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </Box>
          </Stack>

          <Paper variant="outlined" sx={{ bgcolor: "background.default" }}>
            {visibleTasks.length > 0 ? (
              <List disablePadding>
                {visibleTasks.map((task, index) => (
                  <ListItem
                    key={task.id || index}
                    divider={index !== visibleTasks.length - 1}
                    secondaryAction={
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => deleteTodo(tasks.findIndex((t) => t.id === task.id))}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id, task.completed)}
                        color="success"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.text}
                      sx={{
                        textDecoration: task.completed ? "line-through" : "none",
                        color: task.completed ? "text.secondary" : "text.primary",
                        opacity: task.completed ? 0.8 : 1
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your first task to build momentum.
                </Typography>
              </Box>
            )}
          </Paper>
        </Stack>
      </Paper>

      <Dialog open={profileOpen} onClose={closeProfileDialog} fullWidth maxWidth="xs">
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {profileError && <Alert severity="error">{profileError}</Alert>}
            {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}

            <TextField
              label="Name"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={profileLoading}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              disabled={profileLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProfileDialog} disabled={profileLoading}>
            Cancel
          </Button>
          <Button onClick={saveProfileChanges} variant="contained" disabled={profileLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TodoComp;
