import {
  // wrap
  // isNxsMimeContent,
  WEB_NXS_MIME_TYPE,
  NxsMimeContent,
} from './nxs-mime-type'
import { hasNavigatorPermission } from './permissions'
// import { jsonParse } from './json'

// todo: uncomment read functions when needed

type Representations = {
  text: string
  html?: string
  nxs?: NxsMimeContent
}

// writes a single ClipboardItem with one or more representations
export async function clipboardWrite({ text, html, nxs }: Representations) {
  // throw new Error('test')

  const clipboardItem = new ClipboardItem({
    'text/plain': new Blob(
      // wrap
      [text],
      { type: 'text/plain' },
    ),
    ...(html
      ? {
          'text/html': new Blob(
            // wrap
            [html],
            { type: 'text/html' },
          ),
        }
      : null),
    ...(nxs &&
    // writing web custom formats requires clipboard perm in Chrome, which combines both read and write access; we need to check both to prevent full copy failure. clipboard access can be set by user at `chrome://settings/content/siteDetails?site=<URL>`.
    (await hasClipboardReadAccess()) &&
    (await hasClipboardWriteAccess())
      ? {
          // Web custom formats for the Async Clipboard API: https://developer.chrome.com/blog/web-custom-formats-for-the-async-clipboard-api
          [WEB_NXS_MIME_TYPE]: new Blob(
            // wrap
            [JSON.stringify(nxs)],
            { type: WEB_NXS_MIME_TYPE },
          ),
        }
      : null),
  })

  await navigator.clipboard.write([clipboardItem])
}

// export async function clipboardReadNxs() {
//   const blob = await clipboardRead(WEB_NXS_MIME_TYPE)

//   if (blob === null) return null // no clipboard read access

//   if (blob) {
//     const content = jsonParse(await blob.text())
//     if (isNxsMimeContent(content)) return content
//   }
// }

// // return null if clipboard access is not granted. return undefined if clipboard access is granted but read fails.
// export async function clipboardRead(mimeType: string = 'text/plain') {
//   const hasReadAccess = await hasClipboardReadAccess()

//   if (!hasReadAccess) return null

//   try {
//     const clipboardItems = await navigator.clipboard.read()
//     const item = clipboardItems.find((item) => item.types.includes(mimeType))
//     return item?.getType(mimeType)
//   } catch (ex) {
//     console.error('failed to read clipboard', ex)
//   }
// }

function hasClipboardReadAccess() {
  return hasNavigatorPermission(
    'clipboard-read' as PermissionName, // Type PermissionName for Permission API doesn't contain correct types · Issue #33923 · microsoft/TypeScript · GitHub: https://github.com/microsoft/TypeScript/issues/33923
  )
}

function hasClipboardWriteAccess() {
  return hasNavigatorPermission(
    'clipboard-write' as PermissionName, // Type PermissionName for Permission API doesn't contain correct types · Issue #33923 · microsoft/TypeScript · GitHub: https://github.com/microsoft/TypeScript/issues/33923
  )
}
