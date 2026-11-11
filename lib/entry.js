/**
 * Loader entry shim.
 *
 * The profile patch names this file rather than ./index.js so that pointing the
 * entry at a new path is a real loader-tree change: a comment-only patch edit
 * does not restart the entry, and host code changes would otherwise keep
 * running the previously imported module until the app restarts.
 *
 * @module dsh-token-usage/entry
 */
export { apply, inject, name } from './index.js'
