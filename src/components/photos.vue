<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from "vue";
import { usePhotoStore } from "../store";

const photoStore = usePhotoStore();
const showModal = ref(false);
const selectedPhoto = ref<{
  url: string;
  name: string;
  location: string;
  fullUrl: string;
} | null>(null);
const modalRef = ref<HTMLDialogElement | null>(null);

const imageLoaded = ref<Record<string, boolean>>({});
const fullImageLoaded = ref(false);

const onImageLoad = (photoId: string) => {
  imageLoaded.value[photoId] = true;
};

const openModal = (photoUrl: string, name: string, location: string, fullUrl: string) => {
  selectedPhoto.value = { url: photoUrl, name, location, fullUrl };
  showModal.value = true;
  fullImageLoaded.value = false;
  document.body.classList.add("no-scroll");
  modalRef.value?.showModal();
};

const closeModal = () => {
  selectedPhoto.value = null;
  showModal.value = false;
  document.body.classList.remove("no-scroll");
  modalRef.value?.close();
};

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bottomPosition = document.body.offsetHeight - 100;
  if (scrollPosition >= bottomPosition && !photoStore.isLoadingMore) {
    photoStore.loadMorePhotos();
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  photoStore.fetchPhotos();
});

watch(
  () => photoStore.searchQuery,
  () => {
    photoStore.fetchPhotos(photoStore.searchQuery, 1);
  },
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="photo-grid">
    <template
      v-if="photoStore.isSearching || (photoStore.isLoadingMore && photoStore.photos.length === 0)"
    >
      <div class="photo-container" :class="{ tall: i % 2 === 0 }" v-for="i in 15" :key="i">
        <div class="placeholder-image shimmer">
          <div class="placeholder-text shimmer"></div>
          <div class="placeholder-text shimmer"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div
        v-for="(photo, index) in photoStore.photos"
        :key="photo.id"
        class="photo-container"
        :class="{ tall: index % 2 === 0 }"
        @click="
          openModal(
            photo.urls.regular,
            photo.user.name,
            photo.user.location as string,
            photo.urls.full,
          )
        "
      >
        <div class="image-wrapper">
          <img
            :src="photo.urls.thumb"
            :alt="photo.alt_description"
            class="photo-image thumb-image"
          />
          <img
            :src="photo.urls.regular"
            :alt="photo.alt_description"
            class="photo-image main-image"
            :class="{ 'image-loaded': imageLoaded[photo.id] }"
            @load="onImageLoad(photo.id)"
          />
        </div>
        <div class="photo-overlay">
          <p>{{ photo.user.name }}</p>
          <p v-if="photo.user.location">{{ photo.user.location }}</p>
        </div>
      </div>
    </template>
    <div
      v-if="photoStore.isLoadingMore"
      class="photo-container"
      :class="{ tall: i % 2 === 0 }"
      v-for="i in 15"
      :key="i"
    >
      <div class="placeholder-image shimmer">
        <div class="placeholder-text shimmer"></div>
        <div class="placeholder-text shimmer"></div>
      </div>
    </div>
  </div>
  <teleport to="body">
    <dialog ref="modalRef" @click.self="closeModal">
      <div class="close">
        <svg
          @click="closeModal"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.00098 5L19 18.9991"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4.99996 18.9991L18.999 5"
            stroke="white"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="modal-content">
        <img
          v-if="selectedPhoto"
          :src="fullImageLoaded ? selectedPhoto.fullUrl : selectedPhoto.url"
          @load="fullImageLoaded = true"
        />
        <div>
          <p class="photographer-name">{{ selectedPhoto?.name }}</p>
          <p class="photographer-location">{{ selectedPhoto?.location }}</p>
        </div>
      </div>
    </dialog>
  </teleport>
</template>

<style scoped>
.load-more-trigger {
  height: 1px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15.75rem, 1fr));
  grid-auto-rows: 9.5rem;
  grid-auto-flow: dense;
  grid-gap: var(--space-3);
  width: 70%;
  margin: 0 auto;
  margin-top: -3.75rem;
  padding-bottom: var(--space-5);
}

.placeholder-image,
.placeholder-text {
  border-radius: var(--space-2);
}

.placeholder-image {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-5);
  gap: var(--space-2);
}

.placeholder-text {
  height: 1.25rem;
  width: 50%;

  & .shimmer {
    background: linear-gradient(
      90deg,
      rgba(190, 190, 190, 0.5) 0%,
      rgb(190 190 190) 50%,
      rgba(190, 190, 190, 0.5) 100%
    );
  }
}

.blur-placeholder {
  filter: blur(20px);
  transition: filter 0.3s;
}

.blur-placeholder.loaded {
  filter: blur(0);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.thumb-image,
.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-image {
  filter: blur(20px);
  transform: scale(1.1);
}

.main-image {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.main-image.image-loaded {
  opacity: 1;
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(207, 207, 207, 0.5) 0%,
    rgb(207 207 207) 50%,
    rgba(207, 207, 207, 0.5) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.photo-container {
  position: relative;
  overflow: hidden;
  border-radius: var(--space-3);
}

.photo-container.tall {
  grid-row: span 3;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, hsla(0, 0%, 0%, 0) 100%);
  color: var(--not-white);
  padding: var(--space-5);
  transition: transform 0.3s ease-in-out;
}

.photo-container:hover .photo-image {
  transform: scale(1.05);
}

.photographer-name {
  font-size: var(--font-size-base);
  font-weight: 500;
  margin: 0;
}

.photographer-location {
  font-size: var(--font-size-sm);
  margin-top: var(--space-1);
  opacity: 0.8;
}

dialog {
  width: 80%;
  border: none;
  border-radius: var(--space-3);
  background: transparent;
  padding: 0;
  backdrop-filter: blur(5px);
  margin: auto;
  outline: none;
  overflow: hidden;
}

dialog::backdrop {
  background: hsla(0, 0%, 0%, 0.6);
  backdrop-filter: blur(5px);
}

.close {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-5);
  cursor: pointer;
}

.modal-content {
  display: flex;
  flex-direction: column;
  width: 90%;
  border-radius: var(--space-3);
  margin: 0 auto;
  background: var(--not-white);
  box-shadow: 0 var(--space-1) var(--space-4) rgba(0, 0, 0, 0.3);

  & img {
    height: 70vh;
    border-radius: var(--space-3) var(--space-3) 0 0;
    object-fit: cover;
  }

  & div {
    padding: var(--space-8);
    width: 100%;
    text-align: left;

    & {
      .photographer-name {
        font-size: var(--font-size-xl);
        margin: 0;
        color: hsl(217, 33%, 17%);
      }

      & .photographer-location {
        font-size: var(--font-size-sm);
        color: hsl(215, 16%, 47%);
        margin-top: var(--space-2);
      }
    }
  }
}

@media (max-width: 48rem) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
    grid-auto-rows: 9.5rem;
  }
}
</style>
