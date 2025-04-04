import { create } from 'zustand'
import { persist } from 'zustand/middleware';

export const useRoomStore = create(
    persist(
        (set, get) => ({
            rooms: [],
            roomSelected: {},
            setRooms: (rooms) => set({ rooms }), // Corregido
            fetchRooms: async() => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al obtener rooms');
                    }
                      
                    const data = await response.json();
                    
                    
                    set({ rooms: data.rooms || data });
                    
                    return data;
                } catch (error) {
                    console.error('Error en fetchRooms:', error);
                    throw error; 
                }
            },
            getRooms: () => get().rooms,
            clearRooms: () => set({ rooms: [] }),
            assignRoom: (room) => set({ roomSelected: room }),
        }),
        {
            name: 'room-storage', 
            getStorage: () => localStorage,
        }
    )
);