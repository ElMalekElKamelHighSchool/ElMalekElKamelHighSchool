/* app-data.js
   Firebase/Firestore + الجريدة فقط.
   هذا الملف هو الجزء المنفصل عن index.html.
*/
(function () {
    const firebaseScripts = [
        "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js",
        "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js"
    ];

    function loadScript(src) {
        return new Promise(function(resolve, reject) {
            if ([...document.scripts].some(function(s) { return s.src === src; })) {
                resolve();
                return;
            }
            const s = document.createElement("script");
            s.src = src;
            s.async = false;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    Promise.all(firebaseScripts.map(loadScript))
        .then(function () {
            const firebaseConfig = {
                apiKey: "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",
                authDomain: "hazoma-60ed2.firebaseapp.com",
                projectId: "hazoma-60ed2",
                storageBucket: "hazoma-60ed2.firebasestorage.app",
                messagingSenderId: "962438384604",
                appId: "1:962438384604:web:52db16e5723a8f6d3bdd19"
            };

            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            const db = firebase.firestore();

            db.collection("articles")
                .orderBy("createdAt", "desc")
                .onSnapshot(function (snap) {
                    const grid = document.getElementById("newsGrid");
                    const ticker = document.getElementById("tickerText");
                    if (!grid || !ticker) return;

                    let tickerItems = "  📢  ";
                    grid.innerHTML = "";

                    snap.docs.forEach(function (doc) {
                        const a = doc.data() || {};
                        const hasImg = a.image && String(a.image).trim() !== "";
                        const hasVid = a.video && String(a.video).trim() !== "";

                        tickerItems += ` ${a.title || ""}  ...`;

                        let mediaContent = `<div class="h-4 bg-blue-900"></div>`;

                        if (hasVid) {
                            const videoUrl = String(a.video);
                            const isYouTube =
                                videoUrl.includes("youtube.com") ||
                                videoUrl.includes("youtu.be");

                            if (isYouTube) {
                                let videoId = "";

                                try {
                                    if (videoUrl.includes("youtu.be")) {
                                        videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
                                    } else if (videoUrl.includes("v=")) {
                                        videoId = videoUrl.split("v=")[1].split("&")[0];
                                    }
                                } catch (e) {}

                                mediaContent = `
                                    <div class="img-wrapper relative" oncontextmenu="return false;" style="background:#000;">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src="https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1"
                                            frameborder="0"
                                            style="width:100%;height:100%;pointer-events:auto;">
                                        </iframe>
                                        <div style="position:absolute;top:0;left:0;right:0;height:60px;z-index:10;background:transparent;"></div>
                                        <div style="position:absolute;bottom:0;right:0;width:120px;height:50px;z-index:10;background:transparent;"></div>
                                    </div>
                                `;
                            } else {
                                mediaContent = `
                                    <div class="img-wrapper" oncontextmenu="return false;" style="background:#000;">
                                        <video
                                            width="100%"
                                            height="100%"
                                            controls
                                            controlsList="nodownload nofullscreen noremoteplayback"
                                            disablePictureInPicture
                                            style="width:100%;height:100%;object-fit:cover;">
                                            <source src="${videoUrl}" type="video/mp4">
                                        </video>
                                    </div>
                                `;
                            }
                        } else if (hasImg) {
                            mediaContent = `
                                <div class="img-wrapper">
                                    <img src="${a.image}" loading="lazy" alt="${a.title || ""}">
                                </div>
                            `;
                        }

                        grid.innerHTML += `
                            <article class="news-card animate__animated animate__fadeIn">
                                ${mediaContent}
                                <div class="p-8">
                                    <div class="flex items-center gap-2 mb-4 text-[10px] font-black text-red-700 uppercase">
                                        <span class="w-2 h-2 bg-red-700 rounded-full"></span>
                                        ${a.tag || "أخبار مدرسة الملك الكامل"}
                                    </div>
                                    <h4 class="text-2xl font-black text-blue-900 mb-4 leading-snug h-16 overflow-hidden">
                                        ${a.title || ""}
                                    </h4>
                                    <p class="text-gray-400 text-sm mb-6 line-clamp-2 font-semibold">
                                        ${a.desc || ""}
                                    </p>
                                    <div class="flex justify-between items-center pt-6 border-t border-gray-50">
                                        <span class="text-gray-300 text-[10px] font-bold">
                                            <i class="far fa-calendar-alt ml-1"></i> ${a.date || ""}
                                        </span>
                                        <a href="article.html?id=${encodeURIComponent(doc.id)}" class="text-blue-900 font-black text-sm flex items-center gap-2 hover:gap-4 transition-all">
                                            اقرأ المزيد <i class="fas fa-chevron-left"></i>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        `;
                    });

                    ticker.innerText = tickerItems;
                }, function (error) {
                    console.error("Firestore news error:", error);
                });
        })
        .catch(function (error) {
            console.error("Firebase loader error:", error);
        });
})();
