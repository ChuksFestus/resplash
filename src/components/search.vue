<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { usePhotoStore } from "../store";

const isFocused = ref(false);
const photoStore = usePhotoStore();
const hasSearched = ref(false);
const searchTerm = ref("");

const handleFocus = () => {
	isFocused.value = true;
};

const handleBlur = () => {
	isFocused.value = false;
};

const searchPhotos = () => {
	if (searchTerm.value.trim() === "") return;
	photoStore.searchQuery = searchTerm.value;
	photoStore.fetchPhotos(photoStore.searchQuery);
	hasSearched.value = true;
};

const displayText = computed(() => {
	if (photoStore.isSearching) {
		return `Searching for <span style="font-weight: bold;">"${photoStore.searchQuery}"</span>`;
	} else if (photoStore.searchComplete) {
		return `Search results for <span style="font-weight: bold; color: #6d7b91; text; text-transform: capitalize;">"${photoStore.searchQuery}"</span>`;
	}
	return "";
});

const resetSearch = () => {
	photoStore.resetSearch("african");
	hasSearched.value = false;
	searchTerm.value = "";
};

onMounted(() => {
	photoStore.resetSearch();
	hasSearched.value = false;
});
</script>

<template>
	<div class="search-container">
		<div v-if="!hasSearched" class="input-container" :class="{ focused: isFocused }">
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
					stroke="#64748B"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M21 21L17 17"
					stroke="#64748B"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<input
				@focus="handleFocus"
				@blur="handleBlur"
				v-model="searchTerm"
				@keyup.enter="searchPhotos"
				type="text"
				placeholder="Search for photos"
			/>
		</div>
		<div v-else class="status-container">
			<button v-if="photoStore.searchComplete" @click="resetSearch" class="reset-button">
				New Search
			</button>
			<p v-html="displayText"></p>
		</div>
	</div>
</template>

<style scoped>
.search-container {
	background: var(--grayish);
	height: 40vh;
	display: flex;
	justify-content: center;
	align-items: center;

	& p {
		padding-top: var(--space-4);
	}
}

.input-container {
	display: flex;
	background: var(--not-white);
	width: 80%;
	height: var(--space-16);
	border-radius: var(--space-3);
	padding: 0 var(--space-5);
	align-items: center;
	gap: var(--space-5);
	box-shadow:
		0 var(--space-1) var(--space-3) 0 rgb(0 0 0 / 0.1),
		0 var(--space-1) var(--space-2) calc(var(--space-1) * -1) rgb(0 0 0 / 0.1);
	border: 2px solid transparent;
	transition: border-color 0.3s ease;
}

.input-container input {
	font-size: var(--font-size-base);
	border: none;
	width: 100%;
	background: transparent;
	height: 100%;
	outline: none;
}

.input-container.focused {
	border-color: var(--azure);
}

.status-container {
	width: 80%;

	& p {
		font-size: 2.5rem;
		font-weight: 500;
		color: var(--grayish-2);
	}
}

.reset-button {
	margin-top: var(--space-4);
	padding: var(--space-2) var(--space-4);
	font-size: var(--font-size-base);
	background-color: var(--not-white);
	border: none;
	border-radius: var(--space-2);
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.reset-button:hover {
	background-color: var(--not-white-2);
}
</style>
