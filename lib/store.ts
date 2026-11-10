import { seed } from "./fixture";
import type { AppState, Command } from "./types";

const globalStore = globalThis as typeof globalThis & { reelsmapSessions?: Map<string, AppState> };
const sessions = globalStore.reelsmapSessions ??= new Map<string, AppState>();

export function session(id: string): AppState {
  const existing = sessions.get(id);
  if (existing) return existing;
  const state = seed();
  sessions.set(id, state);
  return state;
}

export function update(state: AppState, command: Command): AppState {
  switch (command.action) {
    case "save": {
      state.places = state.places.map(place => {
        const change = command.places.find(item => item.id === place.id);
        return change ? { ...place, ...change, saved: true } : place;
      });
      state.posts = state.posts.map(post => {
        const places = state.places.filter(place => place.postId === post.id);
        return places.length > 0 && places.every(place => place.saved) ? { ...post, status: "저장됨 (예시)" } : post;
      });
      break;
    }
    case "candidate": {
      state.places = state.places.filter(place => place.postId !== command.postId);
      state.places.push({ id: 6, postId: 4, name: `예시 전망대 리스본 ${command.choice}`, area: "포르투갈 리스본", category: "전망대", destination: "Google 지도", lat: 38.7116, lng: command.choice === "A" ? -9.1305 : -9.138, saved: true, tags: [] });
      state.posts = state.posts.map(post => post.id === 4 ? { ...post, status: "저장됨 (예시)", candidates: [] } : post);
      break;
    }
    case "deletion":
      state.changes = command.decision === "later" ? state.changes.map(change => change.id === command.id ? { ...change, deferred: true } : change) : state.changes.filter(change => change.id !== command.id);
      break;
    case "sync":
      state.lists = state.lists.map(list => list.id === command.id ? { ...list, sync: command.enabled } : list);
      break;
    case "login":
      state.lists = state.lists.map(list => list.id === command.id ? { ...list, login: true } : list);
      break;
    case "tag":
      state.places = state.places.map(place => place.id === command.id ? { ...place, tags: [...new Set([...place.tags, command.tag.replace(/^#/, "")])] } : place);
      break;
    case "settings": state.settings = command.settings; break;
    case "account":
      switch (command.operation) {
        case "sign-in": state.settings.signedIn = true; break;
        case "sign-out": state.settings.signedIn = false; break;
        case "unlink": state.settings.dmLinked = false; break;
        case "delete": Object.assign(state, { ...seed(), posts: [], places: [], lists: [], changes: [], settings: { ...seed().settings, signedIn: false, dmLinked: false } }); break;
      }
      break;
  }
  return state;
}
