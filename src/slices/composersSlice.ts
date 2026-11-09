import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import type { DsComposer } from '../api/Api'
import { api, proxyMediaUrl } from '../api'
import { keepPendingFeedbackVisible } from '../api/requestTiming'
import { isMockDataSource } from '../config/dataSource'
import { COMPOSERS_MOCK, type Composer } from '../data/composers'

interface CreateComposerDraftParams {
  name: string
  image?: File
  video?: File
}

interface PublishComposerParams {
  composer: Composer
}

interface ComposerActionParams {
  composerId: number
  isLiked?: boolean
}

interface FetchComposersParams {
  minFreq: number
  maxFreq: number
  allowMockFallback: boolean
}

interface FetchComposersResult {
  composers: Composer[]
  warning: string | null
}

interface FetchComposerFeedParams {
  id?: number
  next?: boolean
  allowMockFallback: boolean
}

interface FetchComposerFeedResult {
  composer: Composer
  warning: string | null
}

interface ComposerDraftState {
  draft: Composer | null
  checked: boolean
}

interface ComposersState {
  items: Composer[]
  draft: Composer | null
  draftChecked: boolean
  feedComposer: Composer | null
  feedLoading: boolean
  feedError: string | null
  feedLoadedForAuthenticatedUser: boolean | null
  likedById: Record<number, boolean>
  pendingLikeIds: number[]
  pendingDeleteIds: number[]
  mutationError: string | null
  composersLoading: boolean
  composersRequestId: string | null
  loading: boolean
  error: string | null
}

const initialState: ComposersState = {
  items: [],
  draft: null,
  draftChecked: false,
  feedComposer: null,
  feedLoading: false,
  feedError: null,
  feedLoadedForAuthenticatedUser: null,
  likedById: {},
  pendingLikeIds: [],
  pendingDeleteIds: [],
  mutationError: null,
  composersLoading: false,
  composersRequestId: null,
  loading: false,
  error: null,
}

function updateComposerLikeState(
  state: ComposersState,
  composerId: number,
  isLiked: boolean,
) {
  const item = state.items.find(({ id }) => id === composerId)
  const composer =
    item ??
    (state.feedComposer?.id === composerId ? state.feedComposer : undefined)
  const wasLiked =
    state.likedById[composerId] ?? composer?.currentUserLiked ?? false
  const countChange = Number(isLiked) - Number(wasLiked)

  state.likedById[composerId] = isLiked

  for (const candidate of state.items) {
    if (candidate.id === composerId) {
      candidate.currentUserLiked = isLiked
      candidate.likesCount = Math.max(0, candidate.likesCount + countChange)
    }
  }

  if (state.feedComposer?.id === composerId) {
    state.feedComposer.currentUserLiked = isLiked
    state.feedComposer.likesCount = Math.max(
      0,
      state.feedComposer.likesCount + countChange,
    )
  }
}

function mapComposer(composer: DsComposer): Composer {
  if (composer.id === undefined || !composer.name) {
    throw new Error('Сервис вернул композитора без обязательных данных')
  }

  return {
    id: composer.id,
    name: composer.name,
    description: composer.description ?? '',
    freq1: composer.freq1 ?? 0,
    freq2: composer.freq2 ?? 0,
    likesCount: composer.likes_count ?? 0,
    imageUrl: proxyMediaUrl(composer.image_url ?? ''),
    videoUrl: proxyMediaUrl(composer.video_url ?? ''),
    currentUserIsCreator: composer.current_user_is_creator ?? false,
    currentUserLiked: composer.current_user_liked ?? false,
  }
}

export const fetchComposers = createAsyncThunk<
  FetchComposersResult,
  FetchComposersParams
>('composers/fetchComposers', async (params) => {
  const startedAt = Date.now()
  if (isMockDataSource) {
    await keepPendingFeedbackVisible(startedAt)
    return {
      composers: COMPOSERS_MOCK.filter(
        ({ freq1 }) => freq1 >= params.minFreq && freq1 <= params.maxFreq,
      ),
      warning: null,
    }
  }

  try {
    const response = await api.composers.composersList({
      min_freq: params.minFreq,
      max_freq: params.maxFreq,
    })
    await keepPendingFeedbackVisible(startedAt)

    return {
      composers: response.data.map(mapComposer),
      warning: null,
    }
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    if (!params.allowMockFallback) {
      throw error
    }

    return {
      composers: COMPOSERS_MOCK.filter(
        ({ freq1 }) => freq1 >= params.minFreq && freq1 <= params.maxFreq,
      ),
      warning: 'Сервис недоступен. Показаны демонстрационные данные.',
    }
  }
})

export const fetchComposerFeed = createAsyncThunk<
  FetchComposerFeedResult,
  FetchComposerFeedParams
>('composers/fetchComposerFeed', async (params) => {
  const startedAt = Date.now()
  if (isMockDataSource) {
    const currentIndex =
      params.id === undefined
        ? -1
        : COMPOSERS_MOCK.findIndex(({ id }) => id === params.id)
    const fallbackIndex =
      params.next && currentIndex >= 0
        ? (currentIndex + 1) % COMPOSERS_MOCK.length
        : currentIndex >= 0
          ? currentIndex
          : 0

    await keepPendingFeedbackVisible(startedAt)
    return {
      composer: COMPOSERS_MOCK[fallbackIndex],
      warning: null,
    }
  }

  try {
    const response = await api.composer.feedList(
      params.id === undefined
        ? undefined
        : { id: params.id, next: params.next ?? false },
    )
    await keepPendingFeedbackVisible(startedAt)

    return { composer: mapComposer(response.data), warning: null }
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    if (!params.allowMockFallback) {
      throw error
    }

    const currentIndex =
      params.id === undefined
        ? -1
        : COMPOSERS_MOCK.findIndex(({ id }) => id === params.id)
    const fallbackIndex =
      params.next && currentIndex >= 0
        ? (currentIndex + 1) % COMPOSERS_MOCK.length
        : currentIndex >= 0
          ? currentIndex
          : 0

    return {
      composer: COMPOSERS_MOCK[fallbackIndex],
      warning: 'Сервис недоступен. Показаны демонстрационные данные.',
    }
  }
})

export const createComposerDraft = createAsyncThunk<
  Composer,
  CreateComposerDraftParams
>('composers/createComposerDraft', async ({ name, image, video }) => {
  const startedAt = Date.now()
  try {
    const response = await api.composer.composerCreate({
      name,
      pic: image,
      video,
    })
    await keepPendingFeedbackVisible(startedAt)

    return mapComposer(response.data)
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    throw error
  }
})

export const fetchComposerDraft = createAsyncThunk<
  ComposerDraftState,
  void,
  { rejectValue: string }
>('composers/fetchComposerDraft', async (_, { rejectWithValue }) => {
  const startedAt = Date.now()
  try {
    const response = await api.composer.draftList()
    const result = { draft: mapComposer(response.data), checked: true }
    await keepPendingFeedbackVisible(startedAt)
    return result
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { draft: null, checked: true }
    }

    return rejectWithValue(
      axios.isAxiosError(error)
        ? error.message
        : 'Не удалось загрузить черновик композитора.',
    )
  }
})

export const publishComposer = createAsyncThunk<
  Composer,
  PublishComposerParams
>('composers/publishComposer', async ({ composer }) => {
  const startedAt = Date.now()
  try {
    await api.composer.publishUpdate(composer.id, {
      description: composer.description,
      freq1: composer.freq1,
      freq2: composer.freq2,
    })
    await keepPendingFeedbackVisible(startedAt)

    return composer
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    throw error
  }
})

export const toggleComposerLike = createAsyncThunk<
  ComposerActionParams,
  ComposerActionParams
>('composers/toggleComposerLike', async ({ composerId, isLiked }) => {
  const startedAt = Date.now()
  if (isLiked === undefined) {
    throw new Error('Не удалось определить состояние лайка.')
  }

  try {
    await api.composer.likeCreate(composerId, { like: isLiked ? 1 : 0 })
    await keepPendingFeedbackVisible(startedAt)
    return { composerId, isLiked }
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    throw error
  }
})

export const deleteComposer = createAsyncThunk<
  ComposerActionParams,
  ComposerActionParams
>('composers/deleteComposer', async ({ composerId }) => {
  const startedAt = Date.now()
  try {
    await api.composer.composerDelete(composerId)
    await keepPendingFeedbackVisible(startedAt)
    return { composerId }
  } catch (error) {
    await keepPendingFeedbackVisible(startedAt)
    throw error
  }
})

const composersSlice = createSlice({
  name: 'composers',
  initialState,
  reducers: {
    clearComposerDraft(state) {
      state.draft = null
      state.draftChecked = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComposers.pending, (state, action) => {
        state.composersLoading = true
        state.composersRequestId = action.meta.requestId
        state.error = null
      })
      .addCase(fetchComposers.fulfilled, (state, action) => {
        if (state.composersRequestId !== action.meta.requestId) {
          return
        }

        state.items = action.payload.composers
        for (const composer of action.payload.composers) {
          state.likedById[composer.id] = composer.currentUserLiked ?? false
        }
        state.composersLoading = false
        state.composersRequestId = null
        state.error = action.payload.warning
      })
      .addCase(fetchComposers.rejected, (state, action) => {
        if (state.composersRequestId !== action.meta.requestId) {
          return
        }

        state.composersLoading = false
        state.composersRequestId = null
        state.error =
          action.error.message ?? 'Не удалось загрузить список композиторов.'
      })
      .addCase(fetchComposerFeed.pending, (state) => {
        state.feedLoading = true
        state.feedError = null
      })
      .addCase(fetchComposerFeed.fulfilled, (state, action) => {
        state.feedComposer = action.payload.composer
        state.likedById[action.payload.composer.id] =
          action.payload.composer.currentUserLiked ?? false
        state.feedLoading = false
        state.feedError = action.payload.warning
        state.feedLoadedForAuthenticatedUser =
          !action.meta.arg.allowMockFallback
      })
      .addCase(fetchComposerFeed.rejected, (state, action) => {
        state.feedLoading = false
        state.feedError =
          action.error.message ?? 'Не удалось загрузить ленту композиторов.'
        state.feedLoadedForAuthenticatedUser =
          !action.meta.arg.allowMockFallback
      })
      .addCase(createComposerDraft.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createComposerDraft.fulfilled, (state, action) => {
        state.draft = action.payload
        state.draftChecked = true
        state.loading = false
      })
      .addCase(createComposerDraft.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.error.message ?? 'Не удалось создать черновик композитора.'
      })
      .addCase(fetchComposerDraft.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComposerDraft.fulfilled, (state, action) => {
        state.draft = action.payload.draft
        state.draftChecked = action.payload.checked
        state.loading = false
      })
      .addCase(fetchComposerDraft.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload ??
          action.error.message ??
          'Не удалось загрузить черновик композитора.'
      })
      .addCase(publishComposer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(publishComposer.fulfilled, (state, action) => {
        state.items = [
          ...state.items.filter(({ id }) => id !== action.payload.id),
          action.payload,
        ]
        state.draft = null
        state.loading = false
      })
      .addCase(publishComposer.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.error.message ??
          'Черновик создан, но не удалось опубликовать композитора.'
      })
      .addCase(toggleComposerLike.pending, (state, action) => {
        state.error = null
        state.mutationError = null
        state.pendingLikeIds.push(action.meta.arg.composerId)
      })
      .addCase(toggleComposerLike.fulfilled, (state, action) => {
        const { composerId, isLiked } = action.payload
        if (isLiked !== undefined) {
          updateComposerLikeState(state, composerId, isLiked)
        }
        state.pendingLikeIds = state.pendingLikeIds.filter(
          (id) => id !== composerId,
        )
      })
      .addCase(toggleComposerLike.rejected, (state, action) => {
        const composerId = action.meta.arg.composerId
        state.pendingLikeIds = state.pendingLikeIds.filter(
          (id) => id !== composerId,
        )
        state.mutationError =
          action.error.message ?? 'Не удалось изменить лайк.'
      })
      .addCase(deleteComposer.pending, (state, action) => {
        state.error = null
        state.mutationError = null
        state.pendingDeleteIds.push(action.meta.arg.composerId)
      })
      .addCase(deleteComposer.fulfilled, (state, action) => {
        const { composerId } = action.payload
        state.items = state.items.filter(({ id }) => id !== composerId)
        delete state.likedById[composerId]
        state.pendingDeleteIds = state.pendingDeleteIds.filter(
          (id) => id !== composerId,
        )
      })
      .addCase(deleteComposer.rejected, (state, action) => {
        const composerId = action.meta.arg.composerId
        state.pendingDeleteIds = state.pendingDeleteIds.filter(
          (id) => id !== composerId,
        )
        state.mutationError =
          action.error.message ?? 'Не удалось удалить композитора.'
      })
  },
})

export const { clearComposerDraft } = composersSlice.actions

export default composersSlice.reducer
