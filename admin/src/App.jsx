import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./Pages/LoginPage";
import Dashboard from "./Pages/Dashboard";
import BoothsPage from "./Pages/BoothsPage";
import CreateQuizPage from "./Pages/CreateQuizPage";
import QuizzesPage from "./Pages/QuizzesPage";
import ParticipantsPage from "./Pages/ParticipantsPage";
import ManagersPage from "./Pages/ManagersPage";
import Settings from "./Pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Core Quiz Admin Routes with RBAC */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booths"
            element={
              <ProtectedRoute permission="booths">
                <BoothsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <ProtectedRoute permission="create-quiz">
                <CreateQuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute permission="quizzes">
                <QuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participants"
            element={
              <ProtectedRoute permission="participants">
                <ParticipantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managers"
            element={
              <ProtectedRoute superAdminOnly permission="managers">
                <ManagersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute permission="settings">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
