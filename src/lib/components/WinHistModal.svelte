<script lang="ts">
	import Modal from "./Modal.svelte";
	import { browser } from "$app/environment";

	interface Winner {
		id: number;
		name: string;
		timestamp: string; // exact time
	}

	interface WinnerHistoryEntry {
		date: string; // This is the date (YYYY-MM-DD format)
		winners: Winner[];
	}

	let { showModal = $bindable(false) } = $props();

	let winnerHistory = $state<WinnerHistoryEntry[]>([]);
	let selectedDate = $state<string | null>(null);

	// Load from localStorage on init
	if (browser) {
		const saved = localStorage.getItem("winnerHistory");
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as WinnerHistoryEntry[];
				winnerHistory = parsed;
				if (parsed.length > 0) {
					selectedDate = parsed[0].date;
				}
			} catch (e) {
				console.error("Error loading winner history:", e);
			}
		}
	}

	// Save to localStorage whenever winnerHistory changes
	$effect(() => {
		if (browser && winnerHistory) {
			localStorage.setItem("winnerHistory", JSON.stringify(winnerHistory));
		}
	});

	// Modified function: Now accepts just the winner's name
	export function addWinner(name: string): void {
		const now = new Date();
		const today = now.toISOString().split("T")[0];
		const timestamp = now.toLocaleTimeString();

		const newWinner: Winner = {
			id: Date.now(),
			name,
			timestamp,
		};

		const dateEntry = winnerHistory.find((entry) => entry.date === today);

		if (dateEntry) {
			dateEntry.winners.push(newWinner);
		} else {
			winnerHistory = [
				{
					date: today,
					winners: [newWinner],
				},
				...winnerHistory,
			];
			selectedDate = today;
		}
	}
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Winner History</svelte:fragment>

	<svelte:fragment slot="content">
		<div class="flex gap-2 overflow-x-auto pb-2">
			{#each winnerHistory as entry (entry.date)}
				<button
					class="crackedButton"
					class:bg-blue-600={selectedDate === entry.date}
					class:text-white={selectedDate === entry.date}
					onclick={() => (selectedDate = entry.date)}
				>
					{entry.date}
				</button>
			{/each}
		</div>

		<div
			class="h-[300px] overflow-y-auto mt-4 p-2 border border-gray-300 rounded"
		>
			{#if selectedDate}
				{#each winnerHistory.find((e) => e.date === selectedDate)?.winners || [] as winner (winner.id)}
					<div
						class="flex justify-between items-center p-2 border-b border-gray-200 last:border-0"
					>
						<span class="font-medium">{winner.name}</span>
						<span class="text-sm text-gray-500">{winner.timestamp}</span>
					</div>
				{:else}
					<p class="text-center text-gray-500 italic py-4">
						No winners for this date
					</p>
				{/each}
			{/if}
		</div>
	</svelte:fragment>
</Modal>

