<script lang="ts">
	import Modal from "./Modal.svelte";
	import { browser } from "$app/environment";
	let { showModal = $bindable(false) } = $props();

	function clipboardToNamesArray() {
			navigator.clipboard.readText().then((text) => {
					const names: string[] = text.split(safeSeparator);
					if (names.includes("")) names.splice(names.indexOf(""), 1);
					if (names.length === 0) return;

					if (!overWrite) {
							// Append mode
							let namesToAdd = names;
							
							if (!allowDuplicates) {
									// Deduplicate new names and remove existing ones
									const uniqueNewNames = [...new Set(names)];
									namesToAdd = uniqueNewNames.filter(name => !namesList!.includes(name));
							}
							
							namesList = namesList!.concat(namesToAdd);
					} else {
							// Overwrite mode
							namesList = allowDuplicates ? names : [...new Set(names)];
					}

					localStorage.setItem("lotteryNames", JSON.stringify(namesList));
			});
	}

	function deleteName(i: number) {
			namesList = namesList!.filter((_, idx) => idx !== i);
			localStorage.setItem("lotteryNames", JSON.stringify(namesList));
	}

	let namesList: string[] | undefined = $state();
	if (browser) {
		namesList = JSON.parse(localStorage.getItem("lotteryNames") || "[]");
	}

	let separator = $state("\n");
	const safeSeparator = $derived(separator === "" ? "\n" : separator);

	let overWrite = $state(false);
	let allowDuplicates = $state(false);
	let trimWhiteSpace = $state(true);
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Manage lottery names</svelte:fragment>

	<svelte:fragment slot="content">
		<!-- import from clipboard -->
		<div
			class="bg-mainfg/10 p-2 rounded-md flex flex-col gap-4"
		>
			<div class="flex flex-row justify-between gap-4 ">
				<p class="self-center">Clipboard import</p>
				<button class="crackedButton flex flex-row gap-2 justify-between flex-0"
					onclick={clipboardToNamesArray}>
					<div class="self-center">
					Import 
					</div>
					<svg
						class="h-6 w-6 self-center"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 512 512"
						fill="currentColor"
						><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
							d="M160 0c-23.7 0-44.4 12.9-55.4 32L48 32C21.5 32 0 53.5 0 80L0 400c0 26.5 21.5 48 48 48l144 0 0-272c0-44.2 35.8-80 80-80l48 0 0-16c0-26.5-21.5-48-48-48l-56.6 0C204.4 12.9 183.7 0 160 0zM272 128c-26.5 0-48 21.5-48 48l0 272 0 16c0 26.5 21.5 48 48 48l192 0c26.5 0 48-21.5 48-48l0-220.1c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1L320 128l-48 0zM160 40a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
						/></svg
					>
				</button>
			</div>
			<input
				type="text"
				class="appearance-none p-2 rounded-md border border-mainfg/20 flex-1"
				placeholder="Separator (default newline)"
				bind:value={separator} />
			<div class="flex flex-row justify-between gap-4">
				<button
					class="crackedButton whitespace-nowrap
					{!overWrite
						? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/80 hover:border-red-500'
						: 'bg-green-500/10 hover:bg-green/20 border-green-500/80 hover:border-green-500'}
					"
					onclick={() => {
						overWrite = !overWrite;
					}}
					>
					Overwrite list: 
					{#if overWrite}
						Yes
					{:else}
						No
					{/if}
				</button>
				<button
					class="crackedButton whitespace-nowrap
					{!allowDuplicates
						? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/80 hover:border-red-500'
						: 'bg-green-500/10 hover:bg-green/20 border-green-500/80 hover:border-green-500'}
					"
					onclick={() => {
						allowDuplicates = !allowDuplicates;
					}}
					>
					Allow duplicates: 
					{#if allowDuplicates}
						Yes
					{:else}
						No
					{/if}
				</button>
				<button
					class="crackedButton whitespace-nowrap
					{!trimWhiteSpace
						? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/80 hover:border-red-500'
						: 'bg-green-500/10 hover:bg-green/20 border-green-500/80 hover:border-green-500'}
					"
					onclick={() => {
						trimWhiteSpace = !trimWhiteSpace;
					}}
					>
					Trim whitespace: 
					{#if trimWhiteSpace}
						Yes
					{:else}
						No
					{/if}
				</button>
			</div>
		</div>

		<!-- display list of names -->
		<div class="bg-mainbg/50 rounded-md border border-mainfg/20 mt-4">
			<div
				class="max-h-64 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-mainfg/20 scrollbar-track-transparent"
			>
				{#if !namesList || namesList.length === 0}
					<div class="text-center p-4 text-mainfg/50 italic">
						No names added yet
					</div>
				{:else}
					{#each namesList! as name, i}
						<div
							class="flex items-center justify-between p-2 bg-mainfg/5 rounded-md hover:bg-mainfg/10 transition-colors"
						>
							<span class="text-mainfg/80">{i + 1}. {name.trim()}</span>
							<button
								class="text-red-500/80 hover:text-red-500/100 transition-colors bg-red-500/10 p-1 rounded-sm"
								onclick={() => deleteName(i)}
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
