/* =========================================================
   مدرسة الملك الكامل الثانوية
   RESULT DATA ENGINE

   هذا الملف مسؤول عن:
   - Firebase
   - Firestore
   - حالة النتائج
   - البحث
   - رقم الجلوس
   - الكود السري
   - الدفع
   - عرض الدرجات
   - الطباعة
   ========================================================= */


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",

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


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

}

const db = firebase.firestore();


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentGradeSettings = null;

let currentStudentData = null;


/* =========================================================
   GRADE TITLES
   ========================================================= */

const gradeTitles = {

    "1sec":
        "الصف الأول الثانوي",

    "2sec":
        "الصف الثاني الثانوي",

    "3sec":
        "الصف الثالث الثانوي"

};


/* =========================================================
   PAGE START
   ========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    function () {

        checkGradeStatus();

    }
);


/* =========================================================
   CHECK GRADE STATUS
   ========================================================= */

async function checkGradeStatus() {

    const gradeElement =
        document.getElementById("searchGrade");

    if (!gradeElement) {
        return;
    }


    const grade =
        gradeElement.value;


    resetViews();


    try {

        /*
         * جلب إعدادات الصف
         */

        const configDoc =
            await db
                .collection(`config_${grade}`)
                .doc("settings")
                .get();


        /*
         * النتيجة غير موجودة أو غير منشورة
         */

        if (
            !configDoc.exists ||
            !configDoc.data().isPublished
        ) {

            currentGradeSettings = null;


            showStatusNotice(

                "النتيجة لم ترفع بعد",

                `نتائج ${gradeTitles[grade]} غير متاحة حالياً. تجري الآن عمليات التصحيح والرصد، يرجى المتابعة لاحقاً.`

            );

        }


        /*
         * النتيجة منشورة
         */

        else {

            currentGradeSettings =
                configDoc.data();


            showStatusNotice(

                "النتائج معتمدة وجاهزة للاستعلام",

                `تم اعتماد نتيجة ${gradeTitles[grade]} رسمياً. أدخل رقم الجلوس أو الكود السري للبحث.`,

                true

            );

        }

    }


    /*
     * Error
     */

    catch (err) {

        console.error(
            "CHECK GRADE STATUS ERROR:",
            err
        );


        currentGradeSettings = null;


        showStatusNotice(

            "ترقبوا إعلان النتائج",

            "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."

        );

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

async function handleSearch(e) {

    e.preventDefault();


    const inputElement =
        document.getElementById("searchInput");

    const gradeElement =
        document.getElementById("searchGrade");

    const button =
        document.getElementById("searchBtn");


    if (!inputElement || !gradeElement || !button) {
        return;
    }


    const inputVal =
        inputElement.value.trim();


    const grade =
        gradeElement.value;


    if (!inputVal) {
        return;
    }


    /*
     * التأكد أن النتيجة منشورة
     */

    if (
        !currentGradeSettings ||
        !currentGradeSettings.isPublished
    ) {

        alert(
            "النتيجة غير متاحة للصف المحدد حالياً."
        );

        return;

    }


    /*
     * Loading
     */

    button.disabled = true;

    button.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';


    resetViews();


    try {

        let student = null;


        /* =================================================
           STEP 1
           SEARCH IN MAPPING
           ================================================= */

        const mapDoc =
            await db
                .collection(`mapping_${grade}`)
                .doc(inputVal)
                .get();


        if (mapDoc.exists) {

            student =
                mapDoc.data();

        }


        /* =================================================
           STEP 2
           IF NOT FOUND SEARCH RESULTS
           ================================================= */

        else {

            const resDoc =
                await db
                    .collection(`results_${grade}`)
                    .doc(inputVal)
                    .get();


            if (resDoc.exists) {

                student =
                    resDoc.data();

            }

        }


        /* =================================================
           NOT FOUND
           ================================================= */

        if (!student) {

            document
                .getElementById("notFoundNotice")
                .classList
                .remove("hidden");

            return;

        }


        /* =================================================
           PAYMENT REQUIRED
           ================================================= */

        if (
            student.paymentRequired &&
            !student.isPaid
        ) {

            document
                .getElementById("payAmount")
                .innerText =
                student.amount || "0";


            document
                .getElementById("paymentNotice")
                .classList
                .remove("hidden");


            return;

        }


        /* =================================================
           SECRET CODE PROTECTION
           ================================================= */

        if (
            student.secretID &&
            String(student.secretID).trim() !== "" &&
            String(inputVal).trim() !==
            String(student.secretID).trim()
        ) {

            document
                .getElementById("withheldNotice")
                .classList
                .remove("hidden");


            return;

        }


        /* =================================================
           DISPLAY RESULT
           ================================================= */

        displayResult(student);

    }


    /*
     * ERROR
     */

    catch (err) {

        console.error(
            "SEARCH ERROR:",
            err
        );


        alert(
            "حدث خطأ أثناء جلب البيانات: " +
            err.message
        );

    }


    /*
     * FINALLY
     */

    finally {

        button.disabled = false;


        button.innerHTML =
            '<i class="fas fa-graduation-cap"></i> عرض النتيجة الان';

    }

}


/* =========================================================
   DISPLAY RESULT
   ========================================================= */

function displayResult(student) {

    currentStudentData =
        student;


    /*
     * تحديد الصف
     */

    const gradeKey =
        student.grade ||
        document.getElementById("searchGrade").value;


    /*
     * Student Name
     */

    document
        .getElementById("resStudentName")
        .innerText =
        student.name || "-";


    /*
     * Grade
     */

    document
        .getElementById("resGradeTitle")
        .innerText =
        gradeTitles[gradeKey] || gradeKey;


    /*
     * Seat ID
     */

    document
        .getElementById("resSeatID")
        .innerText =
        student.seatID || "-";


    /*
     * Secret ID
     */

    document
        .getElementById("resSecretID")
        .innerText =
        student.secretID || "-";


    /*
     * Scores Grid
     */

    const grid =
        document.getElementById("scoresGrid");


    grid.innerHTML = "";


    /*
     * تحديد الأعمدة
     */

    const columns =
        currentGradeSettings.displayColumns ||
        Object.keys(student.scores || {});


    /*
     * إذا لا توجد درجات
     */

    if (!columns.length) {

        grid.innerHTML = `

            <div class="col-span-full text-center text-slate-400 p-6">

                لا توجد درجات مسجلة حالياً.

            </div>

        `;

    }


    /*
     * بناء المواد
     */

    columns.forEach(function (col) {

        const score =
            student.scores
                ? (
                    student.scores[col] ||
                    "-"
                )
                : "-";


        grid.innerHTML += `

            <div
                class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1"
            >

                <span
                    class="block text-[11px] font-bold text-slate-400 truncate"
                >
                    ${escapeHTML(col)}
                </span>

                <span
                    class="text-lg font-black text-amber-400 font-mono"
                >
                    ${escapeHTML(score)}
                </span>

            </div>

        `;

    });


    /*
     * Show Result
     */

    document
        .getElementById("resultCard")
        .classList
        .remove("hidden");

}


/* =========================================================
   PRINT CERTIFICATE
   ========================================================= */

function printStudentCertificate() {

    if (!currentStudentData) {
        return;
    }


    const student =
        currentStudentData;


    /*
     * Grade
     */

    const gradeKey =
        student.grade ||
        document.getElementById("searchGrade").value;


    /*
     * Student information
     */

    document
        .getElementById("pName")
        .innerText =
        student.name || "-";


    document
        .getElementById("pGrade")
        .innerText =
        gradeTitles[gradeKey] || gradeKey;


    document
        .getElementById("pSeat")
        .innerText =
        student.seatID || "-";


    document
        .getElementById("pSecret")
        .innerText =
        student.secretID || "-";


    /*
     * Table
     */

    const tbody =
        document.getElementById("pTableBody");


    tbody.innerHTML = "";


    /*
     * Columns
     */

    const columns =
        currentGradeSettings.displayColumns ||
        Object.keys(student.scores || {});


    /*
     * Rows
     */

    columns.forEach(function (col) {

        const score =
            student.scores
                ? (
                    student.scores[col] ||
                    "-"
                )
                : "-";


        tbody.innerHTML += `

            <tr>

                <td style="font-weight:700;">
                    ${escapeHTML(col)}
                </td>

                <td style="font-weight:900; color:#1e3a8a;">
                    ${escapeHTML(score)}
                </td>

            </tr>

        `;

    });


    /*
     * Print
     */

    window.print();

}


/* =========================================================
   SHOW STATUS
   ========================================================= */

function showStatusNotice(
    title,
    msg,
    isReady = false
) {

    const notice =
        document.getElementById("statusNotice");


    const titleElement =
        document.getElementById("statusTitle");


    const msgElement =
        document.getElementById("statusMsg");


    titleElement.innerText =
        title;


    msgElement.innerText =
        msg;


    /*
     * Ready
     */

    if (isReady) {

        notice
            .classList
            .add("border-emerald-500/30");


        titleElement.className =
            "text-2xl font-black text-emerald-400";

    }


    /*
     * Not ready
     */

    else {

        notice
            .classList
            .remove("border-emerald-500/30");


        titleElement.className =
            "text-3xl font-black text-amber-400";

    }


    notice
        .classList
        .remove("hidden");

}


/* =========================================================
   RESET VIEWS
   ========================================================= */

function resetViews() {

    const ids = [

        "statusNotice",

        "resultCard",

        "paymentNotice",

        "notFoundNotice",

        "withheldNotice"

    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);


        if (element) {

            element
                .classList
                .add("hidden");

        }

    });

}


/* =========================================================
   RESET SEARCH
   ========================================================= */

function resetSearch() {

    const input =
        document.getElementById("searchInput");


    if (input) {

        input.value = "";

    }


    currentStudentData =
        null;


    checkGradeStatus();

}


/* =========================================================
   HTML ESCAPE
   حماية من إدخال HTML داخل البيانات
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
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


/* =========================================================
   END
   ========================================================= */
