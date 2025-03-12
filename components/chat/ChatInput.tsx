"use client";

import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Image as ImageIcon,
  X,
  Spinner,
  Clock,
  Trash,
} from "@phosphor-icons/react";
import * as React from "react";
import { AGENT_MODES } from "./ModeSelector";
import { DropdownComp } from "./WalletSelector";
import { useEffect, useState, useRef } from "react";
import { WalletSelector } from "@/components/wallet/WalletSelector";
import { WalletInfo } from "@/lib/hooks/useWallet";
import Image from "next/image";

export const MOCK_MODELS = [
  {
    name: "OpenAI",
    subTxt: "GPT-4o-mini",
  },
  {
    name: "Claude",
    subTxt: "Claude 3.5 Sonnet",
  },
  {
    name: "DeepSeek",
    subTxt: "DeepSeek-V3 Base",
  },
];

export const CHAIN_TYPES = [
  {
    name: "Solana",
    subTxt: "Solana Mainnet",
  },
  {
    name: "Sonic",
    subTxt: "Mobius - Sonic SVM Mainnet",
  },
];

type Item = {
  name: string;
  subTxt: string;
};

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (
    e: React.FormEvent,
    selectedModel: Item,
    fullPrompt: string
  ) => void;
  selectedMode: (typeof AGENT_MODES)[0];
  setSelectedMode: (mode: (typeof AGENT_MODES)[0]) => void;
  selectedModel: Item;
  setSelectedModel: (model: Item) => void;
  selectedWallet: Item | null;
  setSelectedWallet: (wallet: Item | null) => void;
  selectedChainType: Item;
  setSelectedChainType: (chainType: Item) => void;
}

// Helper function to format timestamps
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than a minute
  if (diff < 60 * 1000) {
    return "Just now";
  }

  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }

  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }

  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// Add a hook to store recently uploaded images in localStorage
const useRecentImages = () => {
  const [recentImages, setRecentImages] = useState<
    Array<{ url: string; timestamp: number }>
  >([]);

  // Load recent images from localStorage on component mount
  useEffect(() => {
    const storedImages = localStorage.getItem("recentImages");
    if (storedImages) {
      try {
        setRecentImages(JSON.parse(storedImages));
      } catch (e) {
        console.error("Error parsing stored images:", e);
      }
    }
  }, []);

  // Add a new image to the recent images list
  const addRecentImage = (url: string) => {
    const newImage = { url, timestamp: Date.now() };
    const updatedImages = [newImage, ...recentImages].slice(0, 10); // Keep only the 10 most recent
    setRecentImages(updatedImages);
    localStorage.setItem("recentImages", JSON.stringify(updatedImages));
  };

  // Remove an image from the recent images list
  const removeRecentImage = (url: string) => {
    const updatedImages = recentImages.filter((img) => img.url !== url);
    setRecentImages(updatedImages);
    localStorage.setItem("recentImages", JSON.stringify(updatedImages));
  };

  return { recentImages, addRecentImage, removeRecentImage };
};

export function ChatInput({
  input,
  setInput,
  onSubmit,
  selectedMode,
  setSelectedMode,
  selectedModel,
  setSelectedModel,
  selectedWallet,
  setSelectedWallet,
  selectedChainType,
  setSelectedChainType,
}: ChatInputProps) {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingPreview, setIsDeletingPreview] = useState(false);
  const [deletingImageIds, setDeletingImageIds] = useState<string[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showRecentImages, setShowRecentImages] = useState(false);
  const { recentImages, addRecentImage, removeRecentImage } = useRecentImages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedImage(file);

    // Upload
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url } = await response.json();
      // Store the URL separately instead of adding to input
      setUploadedImageUrl(url);
      // Add to recent images
      addRecentImage(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsUploading(false);
    }
  };

  const selectRecentImage = (url: string) => {
    setImagePreview(url);
    setUploadedImageUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Combine the input with the image URL for the API call
      // but don't show it in the UI
      const fullPrompt = uploadedImageUrl
        ? `${input}\nURL: ${uploadedImageUrl}`
        : input;

      // Call onSubmit with the fullPrompt as a separate parameter
      // instead of modifying the event object
      onSubmit(e, selectedModel, fullPrompt);

      // Reset image state
      setSelectedImage(null);
      setImagePreview(null);
      setUploadedImageUrl(null);

      // Clear the input field
      setInput("");
    }
  };

  // Convert WalletInfo to Item format
  const handleWalletSelect = (wallet: WalletInfo) => {
    setSelectedWallet({
      name: wallet.name,
      subTxt: wallet.displayAddress,
    });
  };

  // Add this function to handle image deletion
  const handleDeleteImage = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // Prevent triggering the parent click event

    // Add the URL to the deleting list
    setDeletingImageIds((prev) => [...prev, url]);

    try {
      // Delete from Supabase storage
      const response = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Remove from recent images list
      removeRecentImage(url);

      // If the currently selected image is being deleted, clear it
      if (uploadedImageUrl === url) {
        setSelectedImage(null);
        setImagePreview(null);
        setUploadedImageUrl(null);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      // You might want to show an error message to the user here
    } finally {
      // Remove the URL from the deleting list
      setDeletingImageIds((prev) => prev.filter((id) => id !== url));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative rounded-2xl bg-card/90 dark:bg-card/90 backdrop-blur-xl shadow-md border border-border/50 transition-all duration-200">
        <div className="flex flex-col">
          {/* Current image preview */}
          {imagePreview && (
            <div className="relative p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <ImageIcon size={16} className="mr-1" />
                  Selected Image
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (uploadedImageUrl) {
                      setIsDeletingPreview(true);
                      try {
                        // Delete from Supabase storage
                        const response = await fetch("/api/upload/delete", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ url: uploadedImageUrl }),
                        });

                        if (!response.ok) {
                          throw new Error("Failed to delete image");
                        }

                        // Remove from recent images list
                        removeRecentImage(uploadedImageUrl);
                      } catch (error) {
                        console.error("Error deleting image:", error);
                      } finally {
                        setIsDeletingPreview(false);
                      }
                    }

                    // Clear the image state
                    setSelectedImage(null);
                    setImagePreview(null);
                    setUploadedImageUrl(null);
                  }}
                  className="p-1 rounded-full hover:bg-accent/10 text-muted-foreground"
                  disabled={isDeletingPreview}
                >
                  {isDeletingPreview ? (
                    <Spinner size={16} className="animate-spin" />
                  ) : (
                    <X size={16} />
                  )}
                </button>
              </div>
              <Image
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain border border-border/50 bg-white"
              />
            </div>
          )}

          {/* Recent images section */}
          {!imagePreview && showRecentImages && recentImages.length > 0 && (
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Clock size={16} className="mr-1" />
                  Recent Images
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecentImages(false)}
                  className="p-1 rounded-full hover:bg-accent/10 text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {recentImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer rounded-md overflow-hidden border border-border/50 hover:border-accent/50 transition-colors group"
                    onClick={() => selectRecentImage(img.url)}
                  >
                    <Image
                      src={img.url}
                      alt={`Recent ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1">
                      <span className="text-[10px] text-white/80">
                        {formatTimestamp(img.timestamp)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteImage(e, img.url)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                      disabled={deletingImageIds.includes(img.url)}
                    >
                      {deletingImageIds.includes(img.url) ? (
                        <Spinner size={12} className="animate-spin" />
                      ) : (
                        <Trash size={12} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text input */}
          <div className="relative flex items-center min-h-[72px]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e as any);
                  }
                }
              }}
              placeholder="Ask anything..."
              className="w-full h-[72px] px-6 py-4 outline-none text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center h-12 p-2 border-t border-border/50">
            <div className="flex items-center overflow-x-auto scrollbar-none">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="relative">
                {isUploading ? (
                  <div className="p-2 text-accent">
                    <Spinner size={20} className="animate-spin" />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRecentImages(!showRecentImages)}
                      className={`p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors mr-1 ${
                        showRecentImages ? "text-accent bg-accent/10" : ""
                      }`}
                      disabled={isUploading || recentImages.length === 0}
                      title="Recent images"
                    >
                      <Clock size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
                      disabled={isUploading}
                      title="Upload new image"
                    >
                      <ImageIcon size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="ml-auto flex items-center">
              <button
                type="submit"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                disabled={!input.trim() || isUploading || isDeletingPreview}
              >
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
