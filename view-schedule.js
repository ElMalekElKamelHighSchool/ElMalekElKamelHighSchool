/* ============================================================
   مدرسة الملك الكامل الثانوية
   OFFICIAL SCHEDULE VIEWER

   File:
   assets/js/view-schedule.js

   مسؤول عن:
   Firebase
   Firestore
   قراءة الرابط
   جلب الجدول
   عرض الجدول
   بيانات المدرسة
   التوقيعات
   التاريخ
============================================================ */


/* ============================================================
   FIREBASE CONFIG
============================================================ */

const FIREBASE_CONFIG = {

    apiKey:
        "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",

    authDomain:
        "hazoma-60ed2.firebaseapp.com",

    projectId:
        "hazoma-60ed2",

    storageBucket:
        "hazoma-60ed2.firebasestorage.app",

    messagingSenderId:
        "962438384604",

    appId:
        "1:962438384604:web:52db16e5723a8f6d3bdd19"

};


/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let db = null;

let currentGrade = "";

let currentType = "";

let currentScheduleData = null;


/* ============================================================
   DOM HELPERS
============================================================ */

function getElement(id) {

    return document.getElementById(id);

}


/* ============================================================
   SET TEXT
============================================================ */

function setText(id, value) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }


    if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    ) {

        element.textContent =
            String(value);

    } else {

        element.textContent =
            "................";

    }

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* ============================================================
   DATE
============================================================ */

function setPrintDate() {

    const dateElement =
        getElement("printDate");

    if (!dateElement) {
        return;
    }


    const now =
        new Date();


    const formatter =
        new Intl.DateTimeFormat(
            "ar-EG",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    dateElement.textContent =
        formatter.format(now);

}


/* ============================================================
   URL PARAMETERS
============================================================ */

function getURLParameters() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {

        grade:
            (
                params.get("grade") ||
                ""
            ).trim(),

        type:
            (
                params.get("type") ||
                ""
            ).trim()

    };

}


/* ============================================================
   GRADE NAME
============================================================ */

function getGradeName(grade) {

    const grades = {

        grade1:
            "الصف الأول الثانوي",

        grade2:
            "الصف الثاني الثانوي",

        grade3:
            "الصف الثالث الثانوي",

        "1":
            "الصف الأول الثانوي",

        "2":
            "الصف الثاني الثانوي",

        "3":
            "الصف الثالث الثانوي",

        "1sec":
            "الصف الأول الثانوي",

        "2sec":
            "الصف الثاني الثانوي",

        "3sec":
            "الصف الثالث الثانوي"

    };


    return (
        grades[grade] ||
        grade
    );

}


/* ============================================================
   TYPE NAME
============================================================ */

function getTypeName(type) {

    const types = {

        lessons:
            "جدول الحصص",

        lesson:
            "جدول الحصص",

        schedule:
            "جدول الحصص",

        class:
            "جدول الحصص",

        classes:
            "جدول الحصص",

        exams:
            "جدول الامتحانات",

        exam:
            "جدول الامتحانات",

        امتحانات:
            "جدول الامتحانات",

        امتحان:
            "جدول الامتحانات",

        حصص:
            "جدول الحصص",

        حصة:
            "جدول الحصص"

    };


    return (
        types[type] ||
        type
    );

}


/* ============================================================
   DOCUMENT TITLE
============================================================ */

function setDocumentTitle() {

    const titleElement =
        getElement("mainTitle");

    if (!titleElement) {
        return;
    }


    const gradeName =
        getGradeName(
            currentGrade
        );


    const typeName =
        getTypeName(
            currentType
        );


    titleElement.textContent =
        `${typeName} - ${gradeName}`;

}


/* ============================================================
   LOADING
============================================================ */

function showLoading() {

    const container =
        getElement("tableContainer");

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="flex flex-col items-center justify-center py-20 text-slate-300"
        >

            <i
                class="fas fa-spinner fa-spin text-3xl mb-2"
            ></i>

            <p>
                جاري جلب البيانات...
            </p>

        </div>

    `;

}


/* ============================================================
   ERROR
============================================================ */

function showError(message) {

    const container =
        getElement("tableContainer");

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="flex flex-col items-center justify-center py-20 text-red-600"
        >

            <i
                class="fas fa-circle-exclamation text-4xl mb-3"
            ></i>

            <p
                class="font-black text-lg"
            >
                تعذر تحميل البيانات
            </p>

            <p
                class="text-sm mt-2 text-slate-500 text-center max-w-xl"
            >
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                onclick="location.reload()"
                class="mt-5 bg-blue-700 text-white px-6 py-2 rounded-lg font-bold"
            >
                إعادة المحاولة
            </button>

        </div>

    `;

}


/* ============================================================
   NOT FOUND
============================================================ */

function showNotFound() {

    const container =
        getElement("tableContainer");

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="flex flex-col items-center justify-center py-20 text-slate-400"
        >

            <i
                class="fas fa-calendar-xmark text-5xl mb-4"
            ></i>

            <p
                class="font-black text-lg"
            >
                لا توجد بيانات للجدول
            </p>

            <p
                class="text-sm mt-2"
            >
                لم يتم العثور على بيانات لهذا الجدول.
            </p>

        </div>

    `;

}


/* ============================================================
   INVALID URL
============================================================ */

function showInvalidURL() {

    showError(
        "رابط الجدول غير مكتمل. يجب أن يحتوي الرابط على grade و type."
    );

}


/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

function initializeFirebase() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            throw new Error(
                "Firebase Library لم يتم تحميلها."
            );

        }


        if (
            firebase.apps &&
            firebase.apps.length > 0
        ) {

            db =
                firebase.firestore();

        } else {

            firebase.initializeApp(
                FIREBASE_CONFIG
            );

            db =
                firebase.firestore();

        }


        if (!db) {

            throw new Error(
                "تعذر إنشاء اتصال Firestore."
            );

        }


        console.log(
            "Firebase initialized successfully."
        );


        return true;

    }

    catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );


        showError(
            "حدث خطأ أثناء الاتصال بقاعدة البيانات."
        );


        return false;

    }

}


/* ============================================================
   GET SCHEDULE DOCUMENT ID
============================================================ */

function getScheduleDocumentId() {

    return (
        `${currentGrade}_${currentType}`
    );

}


/* ============================================================
   LOAD SCHOOL INFORMATION
============================================================ */

async function loadSchoolInformation() {

    try {

        if (!db) {
            return;
        }


        const docRef =
            db
                .collection("settings")
                .doc("school_info");


        const snapshot =
            await docRef.get();


        if (!snapshot.exists) {

            console.warn(
                "settings/school_info not found."
            );

            return;

        }


        const data =
            snapshot.data() || {};


        /* ======================================================
           MANAGER
        ====================================================== */

        if (
            data.manager !== undefined &&
            data.manager !== null &&
            String(data.manager).trim() !== ""
        ) {

            setText(
                "sign-manager",
                data.manager
            );

        }


        /* ======================================================
           AGENT
        ====================================================== */

        if (
            data.agent !== undefined &&
            data.agent !== null &&
            String(data.agent).trim() !== ""
        ) {

            setText(
                "sign-agent",
                data.agent
            );

        }


        /* ======================================================
           CONTROL
        ====================================================== */

        if (
            data.control_name !== undefined &&
            data.control_name !== null &&
            String(data.control_name).trim() !== ""
        ) {

            setText(
                "sign-control",
                data.control_name
            );


            const controlSection =
                getElement(
                    "controlSection"
                );


            if (controlSection) {

                controlSection.classList.remove(
                    "hidden"
                );

            }

        }

    }

    catch (error) {

        console.warn(
            "School information could not be loaded:",
            error
        );

    }

}


/* ============================================================
   NORMALIZE LESSON DATA
============================================================ */

function normalizeLessons(lessons) {

    if (
        lessons === undefined ||
        lessons === null
    ) {

        return [];

    }


    /* ========================================================
       ARRAY
    ======================================================== */

    if (
        Array.isArray(lessons)
    ) {

        return lessons;

    }


    /* ========================================================
       OBJECT
    ======================================================== */

    if (
        typeof lessons === "object"
    ) {

        return Object.values(
            lessons
        );

    }


    return [];

}


/* ============================================================
   FORMAT FIRESTORE VALUE
============================================================ */

function formatCellValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    /* --------------------------------------------------------
       FIRESTORE TIMESTAMP
    -------------------------------------------------------- */

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        return value
            .toDate()
            .toLocaleDateString(
                "ar-EG"
            );

    }


    /* --------------------------------------------------------
       ARRAY
    -------------------------------------------------------- */

    if (
        Array.isArray(value)
    ) {

        return value
            .map(
                item =>
                    formatCellValue(item)
            )
            .join(" - ");

    }


    /* --------------------------------------------------------
       OBJECT
    -------------------------------------------------------- */

    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(
                value
            );

        }

        catch (error) {

            return "";

        }

    }


    return String(value);

}


/* ============================================================
   RENDER HTML TABLE
============================================================ */

function renderHTMLTable(
    lessons
) {

    const container =
        getElement("tableContainer");

    if (!container) {
        return;
    }


    if (
        !lessons.length
    ) {

        showNotFound();

        return;

    }


    const firstRow =
        lessons[0];


    if (
        !firstRow ||
        typeof firstRow !== "object" ||
        Array.isArray(firstRow)
    ) {

        showNotFound();

        return;

    }


    const columns =
        Object.keys(
            firstRow
        );


    if (
        !columns.length
    ) {

        showNotFound();

        return;

    }


    /* ========================================================
       COLUMN NAMES
    ======================================================== */

    const columnNames = {

        day:
            "اليوم",

        date:
            "التاريخ",

        period:
            "الحصة",

        lesson:
            "الحصة",

        subject:
            "المادة",

        subject_name:
            "المادة",

        teacher:
            "المدرس",

        teacher_name:
            "المدرس",

        class:
            "الفصل",

        classroom:
            "الفصل",

        room:
            "الفصل",

        time:
            "الوقت",

        start:
            "من",

        end:
            "إلى",

        notes:
            "ملاحظات",

        note:
            "ملاحظات"

    };


    /* ========================================================
       TABLE HEADER
    ======================================================== */

    let html = `

        <table>

            <thead>

                <tr>
    `;


    columns.forEach(
        column => {

            const title =
                columnNames[column] ||
                column;


            html += `

                    <th>
                        ${escapeHTML(title)}
                    </th>

            `;

        }
    );


    html += `

                </tr>

            </thead>

            <tbody>

    `;


    /* ========================================================
       TABLE ROWS
    ======================================================== */

    lessons.forEach(
        row => {

            html += `
                <tr>
            `;


            columns.forEach(
                column => {

                    const value =
                        formatCellValue(
                            row[column]
                        );


                    html += `

                        <td>
                            ${escapeHTML(value)}
                        </td>

                    `;

                }
            );


            html += `

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;

}


/* ============================================================
   RENDER TABLE
============================================================ */

function renderTable(data) {

    const container =
        getElement(
            "tableContainer"
        );


    if (!container) {
        return;
    }


    if (!data) {

        showNotFound();

        return;

    }


    /* ========================================================
       SUPPORT MULTIPLE FIELD NAMES
    ======================================================== */

    let lessons =
        data.lessons;


    if (
        lessons === undefined
    ) {

        lessons =
            data.schedule;

    }


    if (
        lessons === undefined
    ) {

        lessons =
            data.table;

    }


    if (
        lessons === undefined
    ) {

        lessons =
            data.rows;

    }


    /* ========================================================
       HTML STRING
       
       IMPORTANT:
       يتم فحصها قبل normalizeLessons
    ======================================================== */

    if (
        typeof lessons === "string" &&
        lessons.trim() !== ""
    ) {

        const cleanHTML =
            lessons.trim();


        if (
            cleanHTML.includes("<table") ||
            cleanHTML.includes("<tr") ||
            cleanHTML.includes("<tbody") ||
            cleanHTML.includes("<thead")
        ) {

            container.innerHTML =
                cleanHTML;

            return;

        }


        /* ----------------------------------------------------
           لو النص ليس HTML
           نعرضه كصف واحد
        ---------------------------------------------------- */

        container.innerHTML = `

            <table>

                <tbody>

                    <tr>

                        <td>
                            ${escapeHTML(cleanHTML)}
                        </td>

                    </tr>

                </tbody>

            </table>

        `;

        return;

    }


    /* ========================================================
       ARRAY / OBJECT
    ======================================================== */

    lessons =
        normalizeLessons(
            lessons
        );


    if (
        !lessons.length
    ) {

        showNotFound();

        return;

    }


    renderHTMLTable(
        lessons
    );

}


/* ============================================================
   LOAD SCHEDULE
============================================================ */

async function loadSchedule() {

    try {

        if (!db) {

            throw new Error(
                "قاعدة البيانات غير متاحة."
            );

        }


        const documentId =
            getScheduleDocumentId();


        console.log(
            "================================"
        );

        console.log(
            "Loading schedule document:"
        );

        console.log(
            "Grade:",
            currentGrade
        );

        console.log(
            "Type:",
            currentType
        );

        console.log(
            "Document ID:",
            documentId
        );

        console.log(
            "================================"
        );


        const scheduleRef =
            db
                .collection(
                    "schedules"
                )
                .doc(
                    documentId
                );


        const snapshot =
            await scheduleRef.get();


        console.log(
            "Schedule exists:",
            snapshot.exists
        );


        if (
            !snapshot.exists
        ) {

            showNotFound();

            return;

        }


        const data =
            snapshot.data() || {};


        currentScheduleData =
            data;


        console.log(
            "Schedule data:",
            data
        );


        /* ====================================================
           CONTROL NAME FROM SCHEDULE
        ==================================================== */

        if (
            data.control_name !== undefined &&
            data.control_name !== null &&
            String(data.control_name).trim() !== ""
        ) {

            setText(
                "sign-control",
                data.control_name
            );


            const controlSection =
                getElement(
                    "controlSection"
                );


            if (controlSection) {

                controlSection.classList.remove(
                    "hidden"
                );

            }

        }


        /* ====================================================
           RENDER TABLE
        ==================================================== */

        renderTable(
            data
        );


        /* ====================================================
           SCHOOL INFORMATION
        ==================================================== */

        await loadSchoolInformation();

    }

    catch (error) {

        console.error(
            "Schedule loading error:",
            error
        );


        let message =
            "حدث خطأ أثناء جلب بيانات الجدول.";


        if (
            error &&
            error.code ===
            "permission-denied"
        ) {

            message =
                "ليس لديك صلاحية لقراءة بيانات هذا الجدول. راجع قواعد Firestore.";

        }


        else if (
            error &&
            error.code ===
            "failed-precondition"
        ) {

            message =
                "هناك مشكلة في إعدادات قاعدة البيانات.";

        }


        else if (
            error &&
            error.code ===
            "unavailable"
        ) {

            message =
                "تعذر الاتصال بخدمة Firestore حالياً. تأكد من اتصال الإنترنت وحاول مرة أخرى.";

        }


        showError(
            message
        );

    }

}


/* ============================================================
   INITIALIZE PAGE
============================================================ */

async function initializePage() {

    console.log(
        "Official schedule viewer started."
    );


    /* ========================================================
       DATE
    ======================================================== */

    setPrintDate();


    /* ========================================================
       LOADING
    ======================================================== */

    showLoading();


    /* ========================================================
       URL
    ======================================================== */

    const params =
        getURLParameters();


    currentGrade =
        params.grade;


    currentType =
        params.type;


    console.log(
        "URL parameters:",
        {
            grade:
                currentGrade,

            type:
                currentType
        }
    );


    /* ========================================================
       VALIDATE
    ======================================================== */

    if (
        !currentGrade ||
        !currentType
    ) {

        showInvalidURL();

        return;

    }


    /* ========================================================
       TITLE
    ======================================================== */

    setDocumentTitle();


    /* ========================================================
       FIREBASE
    ======================================================== */

    const firebaseReady =
        initializeFirebase();


    if (!firebaseReady) {

        return;

    }


    /* ========================================================
       LOAD DATA
    ======================================================== */

    await loadSchedule();

}


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePage,
        {
            once: true
        }
    );

} else {

    initializePage();

                }
