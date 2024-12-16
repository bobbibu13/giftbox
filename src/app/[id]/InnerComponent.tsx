"use client";

import { DoodleDrawer } from "@/components/doodle-drawer";
import { DottedBackground } from "@/components/dotted-background";
import { LetterCanvas } from "@/components/letter-canvas";
import { PhotoUploader } from "@/components/photo-uploader";
import { Toolbar } from "@/components/toolbar";
import { VoiceRecorder } from "@/components/voice-recorder";
import { LetterItem } from "@/utils/type";
import React, { useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { SpotifyPlayer } from '@/components/spotify-player'

export default function DigitalLetterComposer({ id }: { id: string }) {
  const [items, setItems] = useState<LetterItem[]>([]);
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isDoodleDrawerOpen, setIsDoodleDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentItem, setCurrentItem] = useState<LetterItem | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  console.log("id", id);

  const addItem = (item: LetterItem) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const updateItemPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, position } : item))
    );
  };

  const updateItemContent = (
    id: string,
    content: string,
    field: string = "content"
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: content } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    item: LetterItem
  ) => {
    const position = "touches" in e ? e.touches[0] : e;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = position.clientX - rect.left;
    const offsetY = position.clientY - rect.top;

    setIsDragging(true);
    setCurrentItem({
      ...item,
      position: {
        x: item.position.x,
        y: item.position.y,
      },
      offsetX,
      offsetY,
    } as LetterItem & { offsetX: number; offsetY: number });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !currentItem || !canvasRef.current) return;

    const position = "touches" in e ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const x = position.clientX - rect.left - (currentItem as any).offsetX;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = position.clientY - rect.top - (currentItem as any).offsetY;

    updateItemPosition(currentItem.id, { x, y });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentItem(null);
  };

  const addNote = (color: string) => {
    addItem({
      id: Date.now().toString(),
      type: "note",
      content: "",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      rotation: (Math.random() - 0.5) * 10,
      color: color, // Ensure the color is being set correctly
    });
  };

  const addSpotifyPlayer = (spotifyUrl: string) => {
    addItem({
      id: Date.now().toString(),
      type: "spotify",
      content: spotifyUrl,
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      rotation: (Math.random() - 0.5) * 10,
    });
  };

  const addDoodle = (doodleUrl: string) => {
    addItem({
      id: Date.now().toString(),
      type: "doodle",
      content: doodleUrl,
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      rotation: (Math.random() - 0.5) * 10,
    });
  };

  // const handleSendGift = async () => {
  //   // In a real application, you would send the gift data to your backend here
  //   // and generate a unique sharable link. For this example, we'll simulate it.
  //   await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network request
  //   const uniqueId = Math.random().toString(36).substring(2, 15);
  //   return `https://yourdomain.com/gift/${uniqueId}`;
  // };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen overflow-hidden bg-stone-200 flex flex-col relative">
        <DottedBackground />
        <main
          className="flex-1 relative overflow-hidden z-20"
          ref={canvasRef}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <LetterCanvas
            items={items}
            updateItemPosition={updateItemPosition}
            updateItemContent={updateItemContent}
            deleteItem={deleteItem}
            handleDragStart={handleDragStart}
            isDragging={isDragging}
            currentItem={currentItem}
          />
        </main>
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <Toolbar
            onAddPhoto={() => setIsPhotoUploaderOpen(true)}
            onAddNote={addNote}
            onRecordVoice={() => setIsVoiceRecorderOpen(true)}
            onAddSpotify={addSpotifyPlayer}
            onAddDoodle={() => setIsDoodleDrawerOpen(true)}
          />
        </div>
        {isPhotoUploaderOpen && (
          <PhotoUploader
            onClose={() => setIsPhotoUploaderOpen(false)}
            onPhotoAdd={(photoUrl) => {
              addItem({
                id: Date.now().toString(),
                type: "photo",
                content: photoUrl,
                position: { x: Math.random() * 200, y: Math.random() * 200 },
                rotation: (Math.random() - 0.5) * 10,
                caption: "",
              });
              setIsPhotoUploaderOpen(false);
            }}
          />
        )}
        {isVoiceRecorderOpen && (
          <VoiceRecorder
            onClose={() => setIsVoiceRecorderOpen(false)}
            onVoiceAdd={(audioBlob) => {
              addItem({
                id: Date.now().toString(),
                type: "voice",
                content: audioBlob,
                position: { x: Math.random() * 200, y: Math.random() * 200 },
                rotation: (Math.random() - 0.5) * 10,
              });
              setIsVoiceRecorderOpen(false);
            }}
          />
        )}
        {isDoodleDrawerOpen && (
          <DoodleDrawer
            onClose={() => setIsDoodleDrawerOpen(false)}
            onDoodleAdd={(doodleUrl) => {
              addDoodle(doodleUrl);
              setIsDoodleDrawerOpen(false);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
}
