<script lang="ts">
	import { browser } from "$app/environment";
	import Modal from "./Modal.svelte";
	import { slide } from "svelte/transition";
	import { type Winner, type WinnerHistoryEntry } from "$lib/winTypes";

	let { showModal = $bindable(false) } = $props();
	let winnerHistory = $state<WinnerHistoryEntry[]>([]);
	let selectedDate = $state<string>(getLocalDateString(new Date()));
	let openMenuId = $state<number | null>(null); // mini menu state

	function getLocalDateString(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

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

	$effect(() => {
		if (!browser) return;

		const handleClickOutside = () => {
			openMenuId = null;
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	});

	// Add winner and store
	export function addWinner(name: string): Winner {
		const now = new Date();
		const today = getLocalDateString(now);
		const timestamp = now.toLocaleTimeString();

		const newWinner: Winner = {
			id: Date.now(),
			name,
			timestamp,
			markedPresent: false,
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

		return newWinner;
	}

	let currentHistEntry: WinnerHistoryEntry | null = $derived.by(() => {
		const curHist = winnerHistory.find((e) => e.date === selectedDate);
		if (curHist) return curHist;
		return null;
	});

	function copyWinnersList() {
		if (!currentHistEntry) return;

		const names = currentHistEntry.winners.map((w) => w.name);
		const text = names.join("\n");

		navigator.clipboard.writeText(text).catch((e) => {
			console.error("Failed to copy text:", e);
		});
	}

	function deleteEntry(i: number) {
		const curEntry = winnerHistory.find((e) => e.date === selectedDate);
		curEntry?.winners.splice(i, 1);
	}

	export function togglePresent(id: number) {
		const curEntry = winnerHistory.find((e) => e.date === selectedDate);
		if (!curEntry) {
			console.error("No entry found for date", selectedDate);
			return;
		}
		const winner = curEntry.winners.find((w) => w.id === id);
		if (!winner) {
			console.error("No winner found with id", id);
			return;
		}
		winner.markedPresent = !winner.markedPresent;
	}

	export function countWins(name: string): [number, number, number] {
		return winnerHistory.reduce(
			([totalWins, totalAbsent, totalPresent], entry) => {
				let winsInEntry = 0;
				let absentInEntry = 0;
				let presentInEntry = 0;

				for (const winner of entry.winners) {
					if (winner.name === name) {
						winsInEntry++;
						if (!winner.markedPresent) {
							absentInEntry++;
						} else {
							presentInEntry++;
						}
					}
				}

				return [
					totalWins + winsInEntry,
					totalAbsent + absentInEntry,
					totalPresent + presentInEntry,
				];
			},
			[0, 0, 0] as [number, number, number],
		);
	}

	let menuTop = $state<number>(0);
	let menuLeft = $state<number>(0);
</script>

<Modal bind:isOpen={showModal} id="histModal">
	<svelte:fragment slot="title">Winner history</svelte:fragment>

	<svelte:fragment slot="content">
		<div class="bg-mainfg/10 p-2 rounded-md flex flex-col gap-4">
			<div class="flex flex-row justify-between gap-2">
				<p>Date picker</p>
				<input type="date" bind:value={selectedDate} />
			</div>
			<button class="crackedButton" onclick={copyWinnersList}>
				Copy winners as list
			</button>
		</div>

		<div
			class="max-h-[31dvh] grid md:grid-cols-2 col-span-3 gap-2 overflow-y-auto p-2
						bg-mainbg/50 rounded-md border border-mainfg/20 mt-4"
		>
			{#if !currentHistEntry}
				<div class="text-center p-4 text-mainfg/50 italic col-span-2">
					No winners on this day
				</div>
			{:else}
				{#each currentHistEntry.winners as winner, i}
					<div
						class="flex items-center justify-between p-2 rounded-md transition-colors gap-2
								{winner.markedPresent
							? 'bg-green-500/10 hover:!bg-green-500/20'
							: 'bg-red-500/10 hover:!bg-red-500/20'}"
					>
						<div class="flex flex-row gap-2 min-w-0">
							<span class="min-w-6 self-center">{i + 1}</span>
							<span class="text-mainfg/80 self-center overflow-hidden"
								>{winner.name}</span
							>
						</div>
						<div class="relative">
							<button
								class="crackedButton text-mainfg/60 hover:text-mainfg/80 transition-colors bg-mainfg/10 hover:bg-mainfg/20 p-1! rounded-sm"
								onclick={(e) => {
									e.stopPropagation();
									const cogWheel = e.currentTarget.getBoundingClientRect();
									const modalEl = document.getElementById("histModal")!;
									menuTop = cogWheel.bottom - modalEl.getBoundingClientRect().top;
									menuLeft = cogWheel.left - modalEl.getBoundingClientRect().left;
									openMenuId = openMenuId === winner.id ? null : winner.id;
								}}
							>
								<!-- cogwheel svg -->
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 512 512"
									class="h-4 w-4"
									fill="currentColor"
								>
									><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
										d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
									/></svg
								>
							</button>
							<!-- TODO: opening menu when at bottom will cause a scrollbar -->
							{#if openMenuId === winner.id}
								<div
									class="fixed bg-mainbg border border-mainfg/20 rounded-md shadow-lg z-50"
									style="top: {menuTop}px; left: {menuLeft}px;"
									transition:slide={{ duration: 200 }}
								>
									<div class="flex flex-col gap-1 p-1 min-w-32">
										<div class="self-center">
											<span class="font-bold gradient-text">
												{#if countWins(winner.name)[0] != 1}
													{countWins(winner.name)[0]} wins
												{:else}
													{countWins(winner.name)[0]} win
												{/if}
											</span>
											(<span class="text-green-500/80"
												>{countWins(winner.name)[2]}</span
											>
											+
											<span class="text-red-500/80"
												>{countWins(winner.name)[1]}</span
											>)
										</div>
										<button
											class="crackedButton text-sm py-1! px-2! hover:bg-mainfg/10 text-left"
											onclick={() => {
												togglePresent(winner.id);
												openMenuId = null;
											}}
										>
											{winner.markedPresent ? "Mark Absent" : "Mark Present"}
										</button>
										<button
											class="crackedButton text-sm py-1! px-2! hover:bg-red-500/10 text-red-500/80 text-left"
											onclick={() => {
												deleteEntry(i);
												openMenuId = null;
											}}
										>
											Delete
										</button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</svelte:fragment>
</Modal>

<style>
	.gradient-text {
		background-image: linear-gradient(
			45deg,
			var(--color-dominantbg),
			var(--color-alt1bg),
			var(--color-alt2bg),
			var(--color-alt3bg),
			var(--color-alt4bg),
			var(--color-alt5bg)
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		display: inline-block;
	}
</style>
