import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api.js";

const CacheContext = createContext(null);

export function CacheProvider({ children }) {
  const [subjects, setSubjects] = useState(null);
  const [games, setGames] = useState(null);
  const [subjectCache, setSubjectCache] = useState({}); // { [id]: subjectWithGames }
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(false);

  async function fetchSubjects(force = false) {
    if (subjects && !force) return subjects;
    setSubjectsLoading(true);
    try {
      const data = await api.get("/subjects");
      setSubjects(data);
      return data;
    } finally {
      setSubjectsLoading(false);
    }
  }

  async function fetchGames(subjectId = null, force = false) {
    const cacheKey = games ? (subjectId ? games.filter(g => g.subjectId === Number(subjectId)) : games) : null;
    if (cacheKey && !force) return cacheKey;
    setGamesLoading(true);
    try {
      const url = subjectId ? `/games?subjectId=${subjectId}` : "/games";
      const data = await api.get(url);
      setGames(data);
      return data;
    } finally {
      setGamesLoading(false);
    }
  }

  async function fetchSubject(id, force = false) {
    if (subjectCache[id] && !force) return subjectCache[id];
    const data = await api.get(`/subjects/${id}`);
    setSubjectCache(prev => ({ ...prev, [id]: data }));
    return data;
  }

  function invalidateSubjects() {
    setSubjects(null);
  }

  function invalidateGames() {
    setGames(null);
  }

  function invalidateSubject(id) {
    setSubjectCache(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function invalidateAll() {
    setSubjects(null);
    setGames(null);
    setSubjectCache({});
  }

  return (
    <CacheContext.Provider
      value={{
        subjects,
        games,
        subjectCache,
        subjectsLoading,
        gamesLoading,
        fetchSubjects,
        fetchGames,
        fetchSubject,
        invalidateSubjects,
        invalidateGames,
        invalidateSubject,
        invalidateAll,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  return useContext(CacheContext);
}
