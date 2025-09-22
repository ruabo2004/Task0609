import React, { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp, Mic, MicOff } from "lucide-react";
import { useRoomSearch } from "@hooks/useRoomSearch";

/**
 * SearchBar Component
 * Advanced search bar with suggestions and voice input
 */
const SearchBar = ({
  placeholder = "Tìm kiếm phòng...",
  onSearch,
  onFocus,
  onBlur,
  showSuggestions = true,
  showHistory = true,
  showVoiceInput = false,
  className = "",
  size = "md", // 'sm', 'md', 'lg'
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    suggestions,
    searchHistory,
    popularSearches,
    getSuggestions,
    clearSuggestions,
    quickSearch,
    removeFromSearchHistory,
    clearSearchHistory,
  } = useRoomSearch();

  // Voice recognition setup (if supported)
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    if (
      (showVoiceInput && "SpeechRecognition" in window) ||
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "vi-VN";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, [showVoiceInput]);

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 1 && showSuggestions) {
      getSuggestions(value);
      setShowDropdown(true);
    } else {
      clearSuggestions();
      setShowDropdown(false);
    }
  };

  // Handle search
  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        quickSearch(searchQuery.trim());
      }
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  // Handle popular search click
  const handlePopularClick = (popularSearch) => {
    setQuery(popularSearch.search_query);
    handleSearch(popularSearch.search_query);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
    if (onFocus) onFocus();
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay to allow clicks on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowDropdown(false);
        if (onBlur) onBlur();
      }
    }, 150);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (speechRecognition && !isListening) {
      setIsListening(true);
      speechRecognition.start();
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      setIsListening(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search
            className={`text-gray-400 ${size === "lg" ? "w-5 h-5" : "w-4 h-4"}`}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className={`
            block w-full pl-10 pr-${
              query || showVoiceInput ? "20" : "4"
            } border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-500 bg-white
            transition-all duration-200
            ${sizeClasses[size]}
            ${isFocused ? "shadow-lg" : "shadow-sm"}
          `}
        />

        {/* Right side buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
          {/* Voice input button */}
          {showVoiceInput && speechRecognition && (
            <button
              type="button"
              onClick={
                isListening ? stopVoiceRecognition : startVoiceRecognition
              }
              className={`p-1 rounded-full transition-colors ${
                isListening
                  ? "text-red-500 hover:text-red-700 bg-red-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={isListening ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (isFocused || query) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gợi ý
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {suggestion.suggestion}
                  </span>
                  {suggestion.frequency && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {suggestion.frequency} lượt
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {showHistory && searchHistory.length > 0 && !query && (
            <div className="py-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tìm kiếm gần đây
                </span>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
              {searchHistory.slice(0, 5).map((historyItem, index) => (
                <div key={index} className="flex items-center group">
                  <button
                    onClick={() => handleHistoryClick(historyItem)}
                    className="flex-1 px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{historyItem}</span>
                  </button>
                  <button
                    onClick={() => removeFromSearchHistory(historyItem)}
                    className="px-2 py-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa khỏi lịch sử"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && !query && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tìm kiếm phổ biến
              </div>
              {popularSearches.slice(0, 5).map((popularSearch, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularClick(popularSearch)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                >
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {popularSearch.search_query}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {popularSearch.search_count} lượt
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Không tìm thấy gợi ý cho "{query}"</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Tìm kiếm "{query}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Voice recognition indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-red-500 animate-pulse"></div>
              <div
                className="w-1 h-6 bg-red-500 animate-pulse"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-4 bg-red-500 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="text-sm">
              Đang nghe... Hãy nói từ khóa tìm kiếm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
