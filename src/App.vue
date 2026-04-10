<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("noche app launch");
});

onShow(() => {
  console.log("noche app show");
});

onHide(() => {
  console.log("noche app hide");
});
</script>

<style></style>
