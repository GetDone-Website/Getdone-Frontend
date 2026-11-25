import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CoursesPage from "../pages/CoursesPage.jsx";
import TasksPage from "../pages/TasksPage.jsx";
import AnalyticsPage from "../pages/AnalyticsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import { ROUTES } from "../utils/constants.js";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Publik: Landing, Login, Register */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      {/* Wajib login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.courses} element={<CoursesPage />} />
          <Route path={ROUTES.tasks} element={<TasksPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
