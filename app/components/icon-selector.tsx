'use client';

import { useState } from 'react';
import { Drawer } from 'vaul';

const iconTemplates = [
  { value: 'fox', label: 'Fox', icon: '🦊' },
  { value: 'leaf', label: 'Leaf', icon: '🍃' },
  { value: 'rocket', label: 'Rocket', icon: '🚀' },
  { value: 'lightbulb', label: 'Lightbulb', icon: '💡' },
  { value: 'ghost', label: 'Ghost', icon: '👻' },
  { value: 'spark', label: 'Spark', icon: '⚡' },

  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'star', label: 'Star', icon: '⭐' },
  { value: 'moon', label: 'Moon', icon: '🌙' },
  { value: 'sun', label: 'Sun', icon: '☀️' },
  { value: 'cloud', label: 'Cloud', icon: '☁️' },
  { value: 'rainbow', label: 'Rainbow', icon: '🌈' },

  { value: 'heart', label: 'Heart', icon: '❤️' },
  { value: 'diamond', label: 'Diamond', icon: '💎' },
  { value: 'crown', label: 'Crown', icon: '👑' },
  { value: 'gem', label: 'Gem', icon: '🔮' },
  { value: 'trophy', label: 'Trophy', icon: '🏆' },
  { value: 'medal', label: 'Medal', icon: '🏅' },

  { value: 'robot', label: 'Robot', icon: '🤖' },
  { value: 'alien', label: 'Alien', icon: '👽' },
  { value: 'skull', label: 'Skull', icon: '💀' },
  { value: 'clown', label: 'Clown', icon: '🤡' },
  { value: 'cat', label: 'Cat', icon: '🐱' },
  { value: 'dog', label: 'Dog', icon: '🐶' },

  { value: 'tiger', label: 'Tiger', icon: '🐯' },
  { value: 'lion', label: 'Lion', icon: '🦁' },
  { value: 'panda', label: 'Panda', icon: '🐼' },
  { value: 'bear', label: 'Bear', icon: '🐻' },
  { value: 'owl', label: 'Owl', icon: '🦉' },
  { value: 'eagle', label: 'Eagle', icon: '🦅' },

  { value: 'snake', label: 'Snake', icon: '🐍' },
  { value: 'dragon', label: 'Dragon', icon: '🐉' },
  { value: 'whale', label: 'Whale', icon: '🐋' },
  { value: 'octopus', label: 'Octopus', icon: '🐙' },
  { value: 'butterfly', label: 'Butterfly', icon: '🦋' },
  { value: 'bee', label: 'Bee', icon: '🐝' },

  { value: 'coffee', label: 'Coffee', icon: '☕' },
  { value: 'pizza', label: 'Pizza', icon: '🍕' },
  { value: 'burger', label: 'Burger', icon: '🍔' },
  { value: 'cake', label: 'Cake', icon: '🎂' },
  { value: 'apple', label: 'Apple', icon: '🍎' },
  { value: 'banana', label: 'Banana', icon: '🍌' },

  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'dice', label: 'Dice', icon: '🎲' },

  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'guitar', label: 'Guitar', icon: '🎸' },
  { value: 'headphones', label: 'Headphones', icon: '🎧' },
  { value: 'camera', label: 'Camera', icon: '📷' },
  { value: 'movie', label: 'Movie', icon: '🎬' },
  { value: 'microphone', label: 'Microphone', icon: '🎤' },

  { value: 'book', label: 'Book', icon: '📚' },
  { value: 'pencil', label: 'Pencil', icon: '✏️' },
  { value: 'paint', label: 'Paint', icon: '🎨' },
  { value: 'toolbox', label: 'Toolbox', icon: '🧰' },
  { value: 'hammer', label: 'Hammer', icon: '🔨' },
  { value: 'gear', label: 'Gear', icon: '⚙️' },

  { value: 'computer', label: 'Computer', icon: '💻' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'keyboard', label: 'Keyboard', icon: '⌨️' },
  { value: 'wifi', label: 'WiFi', icon: '📶' },
  { value: 'lock', label: 'Lock', icon: '🔒' },
  { value: 'key', label: 'Key', icon: '🗝️' },

  { value: 'map', label: 'Map', icon: '🗺️' },
  { value: 'compass', label: 'Compass', icon: '🧭' },
  { value: 'airplane', label: 'Airplane', icon: '✈️' },
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'train', label: 'Train', icon: '🚆' },
  { value: 'ship', label: 'Ship', icon: '🚢' },

  { value: 'gift', label: 'Gift', icon: '🎁' },
  { value: 'balloon', label: 'Balloon', icon: '🎈' },
  { value: 'party', label: 'Party', icon: '🥳' },
  { value: 'magic', label: 'Magic', icon: '🪄' },
  { value: 'target', label: 'Target', icon: '🎯' },
  { value: 'hourglass', label: 'Hourglass', icon: '⏳' },
];

export default function IconSelector() {
  const [selectedIcon, setSelectedIcon] = useState(iconTemplates[0].value);
  const [open, setOpen] = useState(false);

  const visible = iconTemplates.slice(0, 5);
  const selectedItem = iconTemplates.find(i => i.value === selectedIcon);

  const renderLabel = (item: typeof iconTemplates[number], inDrawer = false) => (
    <label
      key={item.value}
      className={`relative flex cursor-pointer items-center justify-center rounded-full border-2 bg-white text-2xl transition-all duration-200 ${inDrawer ? 'h-14 w-14' : 'h-16 w-16'
        } ${selectedIcon === item.value
          ? 'border-main shadow-[0_0_0_4px_rgba(111,207,151,0.25)]'
          : 'border-transparent hover:border-slate-300'
        }`}
    >
      <input
        type="radio"
        name="icon-selector"
        value={item.icon}
        aria-label={item.label}
        checked={selectedIcon === item.value}
        onChange={() => {
          setSelectedIcon(item.value);
          if (inDrawer) setOpen(false);
        }}
        className="sr-only"
      />
      <span aria-hidden="true">{item.icon}</span>
      {selectedIcon === item.value && inDrawer && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-main rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </label>
  );

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <span className="text-xs text-slate-500 uppercase tracking-[0.24em]">
          Choose your avatar
        </span>

        {/* First 5 always visible */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {visible.map(item => renderLabel(item))}
        </div>

        {/* Trigger */}
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-accent transition-colors"
          >
            {selectedItem && !visible.includes(selectedItem) && (
              <span className="text-base relative flex cursor-pointer items-center justify-center rounded-full border-2 bg-white  transition-all duration-200 h-14 w-14">{selectedItem.icon}</span>
              
            )}
            Show more
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </Drawer.Trigger>
      </div>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-background rounded-t-3xl px-6 pt-4 pb-10 max-h-[80vh] outline-none">
          <Drawer.Handle className="mx-auto w-10 h-1 bg-gray-300 rounded-full mb-5" />

          <div className="flex items-center justify-between mb-4">
            <Drawer.Title className="font-bold text-accent text-base">
              Choose your avatar
            </Drawer.Title>
            <Drawer.Close asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </Drawer.Close>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="flex flex-wrap justify-center gap-3 py-4">
              {iconTemplates.map(item => renderLabel(item, true))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
