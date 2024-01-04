import { create } from "zustand";

type SearchStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
};

export const useSearch = create<SearchStore>((set, get) => ({
  //isOpen을 onOpen과 onClose를 통해서 상태변환
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  //현재 isOpen상태를 반전 시켜줌
  toggle: () => set({ isOpen: !get().isOpen }),
}));
