import { getFormatLabel, FormatId, FormatOptions } from '@/format'
import {
  // wrap
  getVisibleFormatIds,
  getAllFormatIds,
  getFormatOption,
} from '@/storage'

export type ConfiguredFormat<T extends FormatId> = {
  id: T
  label: string
  visible: boolean
  isDefault: boolean // `default` is a JS reserved keyword; todo: consider removing this field and instead having implementation infer default format from visibleFormats[0] (currently only 1 instance (in popup.ts) would need to be updated)
  option: FormatOptions[T]
}

export async function getConfiguredFormat<T extends FormatId>(id: T) {
  const visibleFormatIds = await getVisibleFormatIds()

  return makeConfiguredFormat(id, visibleFormatIds)
}

export async function getConfiguredFormats({ visibleOnly }: { visibleOnly?: boolean } = {}) {
  const visibleFormatIds = await getVisibleFormatIds()

  const formatIds = visibleOnly // wrap
    ? visibleFormatIds
    : await getAllFormatIds()

  return Promise.all(formatIds.map((id) => makeConfiguredFormat(id, visibleFormatIds)))
}

async function makeConfiguredFormat<T extends FormatId>(
  id: T,
  visibleFormatIds: FormatId[],
): Promise<ConfiguredFormat<T>> {
  const label = await getFormatLabel(id)
  const option = await getFormatOption(id)

  return {
    id,
    label,
    visible: visibleFormatIds.includes(id),
    isDefault: visibleFormatIds[0] === id,
    option,
  }
}
