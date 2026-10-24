import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { QuizListPage } from '../pages/QuizListPage';
import { TracksPage } from '../pages/TracksPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { SwagsPage } from '../pages/SwagsPage';
import { QuizPlayPage } from '../pages/QuizPlayPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<QuizListPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/swags" element={<SwagsPage />} />
        <Route path="/quiz/:id" element={<QuizPlayPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
};
