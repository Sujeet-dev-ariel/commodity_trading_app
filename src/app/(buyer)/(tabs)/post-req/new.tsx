import { PostRequirementScreen } from "@/features/buyer/requirements/screens/PostRequirementScreen";

/**
 * Thin route — the post form, opened from the My requirements list's
 * "Post requirement" button. `router.back()` returns to the list.
 */
export default function PostRequirementFormRoute() {
  return <PostRequirementScreen />;
}
