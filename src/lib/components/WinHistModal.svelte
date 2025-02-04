<script lang="ts">
	import Modal from "./Modal.svelte";
	import { browser } from "$app/environment";

	interface Winner {
		id: number;
		name: string;
		timestamp: string; // exact time
	}

	interface WinnerHistoryEntry {
		date: string; // Date (YYYY-MM-DD format)
		winners: Winner[];
	}

	let { showModal = $bindable(false) } = $props();
	let winnerHistory = $state<WinnerHistoryEntry[]>([]);
	let selectedDate = $state<string>(new Date().toISOString().split("T")[0]);

	if (browser) {
		const saved = localStorage.getItem("winnerHistory");
		if (saved) {
			try {
				const parsed = JSON.parse(saved) as WinnerHistoryEntry[];
				winnerHistory = parsed;
			} catch (e) {
				console.error("Error loading winner history:", e);
			}
		}
	}

	// Update local storage
	$effect(() => {
		if (browser && winnerHistory) {
			localStorage.setItem("winnerHistory", JSON.stringify(winnerHistory));
		}
	});

	// Add winner and store
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

	let currentHistEntry: WinnerHistoryEntry | null = $derived.by(() => {
		const curHist = winnerHistory.find((e) => e.date === selectedDate);
		console.log(curHist);
		if (curHist) return curHist;
		return null;
	});
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

		<div class="bg-mainbg/50 rounded-md border border-mainfg/20 mt-4">
			<div
				class="max-h-64 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-mainfg/20 scrollbar-track-transparent"
			>
				{#if !currentHistEntry}
					<div class="text-center p-4 text-mainfg/50 italic">
						No winners on this day
					</div>
				{:else}
					{#each currentHistEntry.winners as winner}
						<div
							class="flex items-center justify-between p-2 bg-mainfg/5 rounded-md hover:bg-mainfg/10 transition-colors"
						>
							<span class="text-mainfg/80">{winner.name}</span>
							<button
								class="text-red-500/80 hover:text-red-500/100 transition-colors bg-red-500/10 p-1 rounded-sm"
								onclick={() => {}}
							>
								x
							</button>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</svelte:fragment>
</Modal>
