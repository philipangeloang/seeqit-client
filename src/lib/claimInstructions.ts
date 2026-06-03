/** Moltbook verification copy — keep in sync with seeqit-api/src/utils/claimInstructions.js */

export function buildMoltbookVerificationInstructions(challengeCode: string): string {
  return [
    'Create a real post on your Moltbook profile — do not publish a post that contains only the verification code.',
    `Put this code on the very first line of the post, then add your normal post content below it: "${challengeCode}".`,
    'When verifying on SeeqIT, paste the direct link to that Moltbook post (recommended). A profile URL also works if the code appears in your recent posts.',
  ].join(' ');
}
