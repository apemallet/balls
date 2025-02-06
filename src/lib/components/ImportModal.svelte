<script lang="ts">
	import Modal from "./Modal.svelte";
	import { browser } from "$app/environment";
	import Matter from "$lib/svelteMatter.svelte";
	let { showModal = $bindable(false) } = $props();

	let {Body, Common, Events} = $derived(Matter() || Object);

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

	let namesList: string[] = $state([]);
	let namesAmnt = $derived(namesList.length);
	if (browser) {
		namesList = JSON.parse(localStorage.getItem("lotteryNames") || "[]");
	}

	let separator = $state("\n");
	const safeSeparator = $derived(separator === "" ? "\n" : separator);

	let overWrite = $state(false);
	let allowDuplicates = $state(false);
	let trimWhiteSpace = $state(true);
	let importType = $state<"clipboard" | "manual">("clipboard");
	let newName = $state("");
	let showSettings = $state(false);

	const short = $derived(namesList.map(name =>
			name.split(" ")
					.map(word => word.substring(0, 2))
					.join("")));

	const shuffleIdx = $derived(namesList.map((_, i) => i).sort(() => Common.random()));

	export function shortOf(i: number) {
		return short[shuffleIdx[i % namesAmnt]];
	}

	export function nameOf(i: number) {
		return namesList[shuffleIdx[i % namesAmnt]];
	}

	// Add a single name to current list
	function addName() {
		if (!newName) return;
		
		let name = trimWhiteSpace ? newName.trim() : newName;
		if (name === "") return;

		if (!allowDuplicates && namesList.includes(name)) return;

		namesList = [...namesList, name];
		localStorage.setItem("lotteryNames", JSON.stringify(namesList));
		newName = "";
	}
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Manage lottery names</svelte:fragment>

	<svelte:fragment slot="content">
		<div
			class="relative group min-w-fit transition-all duration-300 pb-4"
		>
			<select
				bind:value={importType}
				class="appearance-none crackedButton pr-8 mr-6 group-hover:border-mainfg/80 group-hover:text-mainfg/80
			focus:outline-none focus:ring-1 focus:ring-mainfg/30 hover:bg-mainfg/10
			transform transition-all duration-300 ease-out cursor-pointer w-full"
			>
				<option value="clipboard">Import from clipboard</option>
				<option value="manual">Add manually</option>
			</select>

			<!-- chevron svg -->
			<svg
				class="absolute right-2 top-3 h-5 w-5 text-mainfg/60 group-hover:text-mainfg/80
					 pointer-events-none transition-transform duration-300 group-hover:scale-105"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width={2}
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</div>

		<div class="bg-mainfg/10 p-2 rounded-md flex flex-col gap-4">
			{#if importType === 'clipboard'}
				<!-- Clipboard import section -->
				<div class="flex flex-row justify-between gap-4">
						<div class="flex flex-row gap-4 flex-1">
								<button 
										class="crackedButton flex flex-row gap-2 justify-between flex-1"
										onclick={clipboardToNamesArray}
								>
										Click to import
										<svg
											class="h-6 w-6 self-center"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 512 512"
											fill="currentColor"
										>
											<path d="M160 0c-23.7 0-44.4 12.9-55.4 32L48 32C21.5 32 0 53.5 0 80L0 400c0 26.5 21.5 48 48 48l144 0 0-272c0-44.2 35.8-80 80-80l48 0 0-16c0-26.5-21.5-48-48-48l-56.6 0C204.4 12.9 183.7 0 160 0zM272 128c-26.5 0-48 21.5-48 48l0 272 0 16c0 26.5 21.5 48 48 48l192 0c26.5 0 48-21.5 48-48l0-220.1c0-12.7-5.1-24.9-14.1-33.9l-67.9-67.9c-9-9-21.2-14.1-33.9-14.1L320 128l-48 0zM160 40a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/>
										</svg>
								</button>
								<button
										class="crackedButton flex gap-2 items-center"
										onclick={() => showSettings = !showSettings}
								>
										{showSettings ? 'Hide' : 'Show'} settings
										<svg
												class={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
												viewBox="0 0 24 24"
												stroke="currentColor"
										>
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M19 9l-7 7-7-7" />
										</svg>
								</button>
						</div>
				</div>

				{#if showSettings}
						<div class="bg-mainfg/5 p-2 rounded-md flex flex-col gap-4">
								<input
										type="text"
										class="appearance-none p-2 rounded-md border border-mainfg/20"
										placeholder="Separator (default newline)"
										bind:value={separator}
								/>
								<div class="flex flex-row justify-between gap-4">
										<button
												class="crackedButton whitespace-nowrap grow min-w-0 overflow-clip
														{!overWrite
																? 'bg-red-500/10! hover:bg-red-500/20!'
																: 'bg-green-500/10! hover:bg-green/20!'}"
												onclick={() => (overWrite = !overWrite)}
										>
												Overwrite: {overWrite ? 'Yes' : 'No'}
										</button>
										<button
												class="crackedButton whitespace-nowrap grow min-w-0 overflow-clip
														{!allowDuplicates
																? 'bg-red-500/10! hover:bg-red-500/20!'
																: 'bg-green-500/10! hover:bg-green/20!'}"
												onclick={() => (allowDuplicates = !allowDuplicates)}
										>
												Duplicates: {allowDuplicates ? 'Yes' : 'No'}
										</button>
								</div>
						<button
							class="crackedButton whitespace-nowrap overflow-hidden
								{!trimWhiteSpace
									? 'bg-red-500/10 hover:bg-red-500/20!'
									: 'bg-green-500/10 hover:bg-green-500/20!'}"
							onclick={() => (trimWhiteSpace = !trimWhiteSpace)}
						>
							Trim whitespace: {trimWhiteSpace ? 'Yes' : 'No'}
						</button>
						</div>
				{/if}
			{:else}
				<!-- Manual entry section -->
				<div class="flex flex-row gap-4">
					<input
						type="text"
						class="appearance-none p-2 rounded-md border border-mainfg/20 flex-1"
						placeholder="Enter name"
						bind:value={newName}
						onkeydown={(e) => e.key === 'Enter' && addName()}
					/>
					<button
						class="crackedButton flex gap-2 justify-center items-center"
						onclick={addName}
						disabled={!newName}
					>
						Add
					</button>
				</div>
			{/if}

			<!-- global settings -->
		</div>

		<!-- display list of names -->
		<div
			class="bg-mainbg/50 rounded-md border border-mainfg/20 mt-4 max-h-64 overflow-y-auto p-2 space-y-2 "
		>
			{#if namesList.length === 0}
				<div class="text-center p-4 text-mainfg/50 italic">
					No names added yet
				</div>
			{:else}
				{#each namesList! as name, i}
					<div
						class="inline-flex w-full items-center justify-between p-2 bg-mainfg/5 rounded-md hover:bg-mainfg/10 transition-colors break-words"
					>
						<span class="text-mainfg/80 min-w-0">{i + 1}. {name.trim()}</span>
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
	</svelte:fragment>
</Modal>
