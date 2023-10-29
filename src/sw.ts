declare const self: ServiceWorkerGlobalScope;

import {ExpirationPlugin} from 'workbox-expiration';
import {cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute} from 'workbox-precaching';
import {clientsClaim, setCacheNameDetails} from 'workbox-core'
import { NavigationRoute, registerRoute } from 'workbox-routing'
setCacheNameDetails({
    prefix: 'closure',
    suffix: 'v1.0.0'
})
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches()

registerRoute(new NavigationRoute(
    createHandlerBoundToURL('index.html'),
))

self.skipWaiting()
clientsClaim()

self.addEventListener('push', (event) =>  {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data?.text()}"`);

    let notificationData = event.data?.json();
    const title = notificationData.title;
    event.waitUntil(self.registration.showNotification(title, notificationData));
});