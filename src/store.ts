import { defineStore } from "pinia";
import { ref } from "vue";

export interface Photo {
  id: string;
  urls: {
    regular: string;
    thumb: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
    location: string | null;
  };
}

export interface Photo {
  id: string;
  urls: {
    regular: string;
    thumb: string;
    full: string;
  };
  alt_description: string;
  user: {
    name: string;
    location: string | null;
  };
}

export const usePhotoStore = defineStore("photos", () => {
  const photos = ref<Photo[]>([]);
  const isSearching = ref(false);
  const isLoadingMore = ref(false);
  const searchComplete = ref(false);
  const searchQuery = ref("");
  const currentPage = ref(1);

  const fetchPhotos = async (query = "african", page = 1) => {
    try {
      if (page === 1) {
        isSearching.value = true;
      } else {
        isLoadingMore.value = true;
      }
      searchComplete.value = false;
      searchQuery.value = query;
      currentPage.value = page;

      const url = query
        ? `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=15`
        : "https://api.unsplash.com/photos/random?count=15";
      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${import.meta.env.VITE_APP_UNSPLASH_ACCESS_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (page === 1) {
        photos.value = query ? data.results : data;
      } else {
        photos.value = [...photos.value, ...(query ? data.results : data)];
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      if (page === 1) {
        isSearching.value = false;
      } else {
        isLoadingMore.value = false;
      }
      searchComplete.value = true;
    }
  };

  const loadMorePhotos = async () => {
    if (!searchQuery.value.trim()) return;
    currentPage.value += 1;
    await fetchPhotos(searchQuery.value, currentPage.value);
  };

  const resetSearch = (defaultQuery = "african") => {
    searchQuery.value = defaultQuery;
    searchComplete.value = false;
    photos.value = [];
    currentPage.value = 1;
    fetchPhotos(defaultQuery);
  };

  return {
    photos,
    isSearching,
    isLoadingMore,
    searchComplete,
    searchQuery,
    currentPage,
    fetchPhotos,
    loadMorePhotos,
    resetSearch,
  };
});
