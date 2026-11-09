const minimumFeedbackDuration = 300

export async function keepPendingFeedbackVisible(startedAt: number) {
  const remaining = minimumFeedbackDuration - (Date.now() - startedAt)

  if (remaining > 0) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, remaining)
    })
  }
}
