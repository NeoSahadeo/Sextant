<script lang="ts">
	import { resolve } from "$app/paths";
import { init, os } from "@neutralinojs/lib";
	import { onMount } from "svelte";

  let ele = $state();

onMount(async()=>{
		init()
    const resp = await fetch("/api/proxy?url=https://discord.com/channels/@me")
    if (resp.ok){
    const doc =  await resp.text()
    ele = doc
    }
})
</script>
<div>
{@html ele}
</div>
