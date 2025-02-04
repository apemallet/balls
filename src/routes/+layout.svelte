<script>
	import { injectAnalytics } from '@vercel/analytics/sveltekit'
  let { children } = $props();
  import "../app.css";
	injectAnalytics();
</script>

{@render children()}
