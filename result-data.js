/* ============================================================
   مدرسة الملك الكامل الثانوية
   RESULT DATA ENGINE
   File: result-data.js

   كل منطق البيانات موجود هنا:
   Firebase
   Firestore
   البحث
   النتيجة
   الدفع
   الكود السري
   الطباعة
   ============================================================ */


/* ============================================================
   FIREBASE CONFIG
   ============================================================ */

const RESULT_FIREBASE_CONFIG = {

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
   FIREBASE INITIALIZATION
   ============================================================ */

(function initializeResultFirebase() {

    try {

        if (!firebase.apps.length) {

            firebase.initializeApp(
                RESULT_FIREBASE_CONFIG
            );

        }

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

    }

})();


/* ============================================================
   FIRESTORE
   ============================================================ */

const RESULT_DB =
    firebase.firestore();


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let currentGradeSettings =
    null;


let currentStudentData =
    null;


/* ============================================================
   GRADE TITLES
   ============================================================ */

const RESULT_GRADE_TITLES = {

    "1sec":
        "الصف الأول الثانوي",

    "2sec":
        "الصف الثاني الثانوي",

    "3sec":
        "الصف الثالث الثانوي"

};


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const searchForm =
            document.getElementById("searchForm");


        const gradeSelect =
            document.getElementById("searchGrade");


        const printButton =
            document.getElementById("printBtn");


        const resetButton =
            document.getElementById("resetBtn");


        /* ================================================
           SEARCH FORM
        ================================================= */

        if (searchForm) {

            searchForm.addEventListener(
                "submit",
                handleSearch
            );

        }


        /* ================================================
           GRADE CHANGE
        ================================================= */

        if (gradeSelect) {

            gradeSelect.addEventListener(
                "change",
                checkGradeStatus
            );

        }


        /* ================================================
           PRINT
        ================================================= */

        if (printButton) {

            printButton.addEventListener(
                "click",
                printStudentCertificate
            );

        }


        /* ================================================
           RESET
        ================================================= */

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetSearch
            );

        }


        /* ================================================
           INITIAL STATUS
        ================================================= */

        checkGradeStatus();

    }
);


/* ============================================================
   CHECK GRADE STATUS
   ============================================================ */

async function checkGradeStatus() {

    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    if (!gradeElement) {

        return;

    }


    const grade =
        gradeElement.value;


    resetViews();


    currentGradeSettings =
        null;


    try {

        /* ================================================
           GET SETTINGS
        ================================================= */

        const configDoc =
            await RESULT_DB
                .collection(
                    `config_${grade}`
                )
                .doc("settings")
                .get();


        /* ================================================
           NOT PUBLISHED
        ================================================= */

        if (
            !configDoc.exists ||
            !configDoc.data() ||
            !configDoc.data().isPublished
        ) {

            currentGradeSettings =
                null;


            showStatusNotice(

                "النتيجة لم ترفع بعد",

                `نتائج ${
                    RESULT_GRADE_TITLES[grade]
                } غير متاحة حالياً. تجري الآن عمليات التصحيح والرصد، يرجى المتابعة لاحقاً.`

            );


            return;

        }


        /* ================================================
           PUBLISHED
        ================================================= */

        currentGradeSettings =
            configDoc.data();


        showStatusNotice(

            "النتائج معتمدة وجاهزة للاستعلام",

            `تم اعتماد نتيجة ${
                RESULT_GRADE_TITLES[grade]
            } رسمياً. أدخل رقم الجلوس أو الكود السري للبحث.`,

            true

        );

    }


    catch (error) {

        console.error(
            "Grade status error:",
            error
        );


        currentGradeSettings =
            null;


        showStatusNotice(

            "ترقبوا إعلان النتائج",

            "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."

        );

    }

}


/* ============================================================
   SEARCH
   ============================================================ */

async function handleSearch(event) {

    event.preventDefault();


    const inputElement =
        document.getElementById(
            "searchInput"
        );


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const searchButton =
        document.getElementById(
            "searchBtn"
        );


    if (
        !inputElement ||
        !gradeElement ||
        !searchButton
    ) {

        return;

    }


    const inputValue =
        inputElement.value.trim();


    const grade =
        gradeElement.value;


    if (!inputValue) {

        return;

    }


    /* ================================================
       CHECK PUBLISH STATUS
    ================================================= */

    if (
        !currentGradeSettings ||
        !currentGradeSettings.isPublished
    ) {

        alert(
            "النتيجة غير متاحة للصف المحدد حالياً."
        );

        return;

    }


    /* ================================================
       LOADING
    ================================================= */

    searchButton.disabled =
        true;


    searchButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';


    resetViews();


    try {

        let student =
            null;


        /* ================================================
           FIRST:
           MAPPING
        ================================================= */

        const mappingDocument =
            await RESULT_DB
                .collection(
                    `mapping_${grade}`
                )
                .doc(inputValue)
                .get();


        if (
            mappingDocument.exists
        ) {

            student =
                mappingDocument.data();

        }


        /* ================================================
           SECOND:
           RESULTS
        ================================================= */

        else {

            const resultDocument =
                await RESULT_DB
                    .collection(
                        `results_${grade}`
                    )
                    .doc(inputValue)
                    .get();


            if (
                resultDocument.exists
            ) {

                student =
                    resultDocument.data();

            }

        }


        /* ================================================
           NOT FOUND
        ================================================= */

        if (!student) {

            const notFound =
                document.getElementById(
                    "notFoundNotice"
                );


            if (notFound) {

                notFound.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ================================================
           PAYMENT
        ================================================= */

        if (
            student.paymentRequired === true &&
            student.isPaid !== true
        ) {

            const amount =
                document.getElementById(
                    "payAmount"
                );


            if (amount) {

                amount.innerText =
                    student.amount || "0";

            }


            const payment =
                document.getElementById(
                    "paymentNotice"
                );


            if (payment) {

                payment.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ================================================
           SECRET CODE PROTECTION
        ================================================= */

        const studentSecret =
            student.secretID !== undefined &&
            student.secretID !== null
                ? String(
                    student.secretID
                ).trim()
                : "";


        const enteredValue =
            String(
                inputValue
            ).trim();


        if (
            studentSecret !== "" &&
            enteredValue !== studentSecret
        ) {

            const withheld =
                document.getElementById(
                    "withheldNotice"
                );


            if (withheld) {

                withheld.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ================================================
           DISPLAY RESULT
        ================================================= */

        displayResult(
            student
        );

    }


    catch (error) {

        console.error(
            "Search error:",
            error
        );


        alert(
            "حدث خطأ أثناء جلب البيانات: " +
            (
                error && error.message
                    ? error.message
                    : "خطأ غير معروف"
            )
        );

    }


    finally {

        searchButton.disabled =
            false;


        searchButton.innerHTML =
            '<i class="fas fa-graduation-cap"></i> عرض النتيجة الان';

    }

}


/* ============================================================
   DISPLAY RESULT
   ============================================================ */

function displayResult(student) {

    currentStudentData =
        student;


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const gradeKey =
        student.grade ||
        (
            gradeElement
                ? gradeElement.value
                : ""
        );


    /* ================================================
       STUDENT NAME
    ================================================= */

    const studentName =
        document.getElementById(
            "resStudentName"
        );


    if (studentName) {

        studentName.innerText =
            student.name || "-";

    }


    /* ================================================
       GRADE
    ================================================= */

    const gradeTitle =
        document.getElementById(
            "resGradeTitle"
        );


    if (gradeTitle) {

        gradeTitle.innerText =
            RESULT_GRADE_TITLES[gradeKey] ||
            gradeKey ||
            "-";

    }


    /* ================================================
       SEAT
    ================================================= */

    const seat =
        document.getElementById(
            "resSeatID"
        );


    if (seat) {

        seat.innerText =
            student.seatID || "-";

    }


    /* ================================================
       SECRET
    ================================================= */

    const secret =
        document.getElementById(
            "resSecretID"
        );


    if (secret) {

        secret.innerText =
            student.secretID || "-";

    }


    /* ================================================
       SCORES
    ================================================= */

    const grid =
        document.getElementById(
            "scoresGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML =
        "";


    const scores =
        student.scores &&
        typeof student.scores === "object"
            ? student.scores
            : {};


    let columns =
        [];


    if (
        currentGradeSettings &&
        Array.isArray(
            currentGradeSettings.displayColumns
        ) &&
        currentGradeSettings.displayColumns.length
    ) {

        columns =
            currentGradeSettings.displayColumns;

    }

    else {

        columns =
            Object.keys(
                scores
            );

    }


    /* ================================================
       NO SCORES
    ================================================= */

    if (!columns.length) {

        grid.innerHTML = `

            <div
                class="col-span-full text-center text-slate-400 p-6 font-bold"
            >
                لا توجد درجات مسجلة حالياً.
            </div>

        `;

    }


    /* ================================================
       BUILD SCORES
    ================================================= */

    columns.forEach(
        function (column) {

            let score =
                "-";


            if (
                Object.prototype.hasOwnProperty.call(
                    scores,
                    column
                )
            ) {

                const value =
                    scores[column];


                /*
                 * مهم:
                 * لا نستخدم || "-"
                 * حتى لا تتحول الدرجة 0 إلى "-"
                 */

                if (
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
                ) {

                    score =
                        value;

                }

            }


            grid.innerHTML += `

                <div
                    class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1"
                >

                    <span
                        class="block text-[11px] font-bold text-slate-400 truncate"
                        title="${escapeHTML(column)}"
                    >
                        ${escapeHTML(column)}
                    </span>

                    <span
                        class="text-lg font-black text-amber-400 font-mono"
                    >
                        ${escapeHTML(score)}
                    </span>

                </div>

            `;

        }
    );


    /* ================================================
       SHOW RESULT
    ================================================= */

    const resultCard =
        document.getElementById(
            "resultCard"
        );


    if (resultCard) {

        resultCard.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   PRINT
   ============================================================ */

function printStudentCertificate() {

    if (!currentStudentData) {

        return;

    }


    const student =
        currentStudentData;


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const gradeKey =
        student.grade ||
        (
            gradeElement
                ? gradeElement.value
                : ""
        );


    /* ================================================
       NAME
    ================================================= */

    const pName =
        document.getElementById(
            "pName"
        );


    if (pName) {

        pName.innerText =
            student.name || "-";

    }


    /* ================================================
       GRADE
    ================================================= */

    const pGrade =
        document.getElementById(
            "pGrade"
        );


    if (pGrade) {

        pGrade.innerText =
            RESULT_GRADE_TITLES[gradeKey] ||
            gradeKey ||
            "-";

    }


    /* ================================================
       SEAT
    ================================================= */

    const pSeat =
        document.getElementById(
            "pSeat"
        );


    if (pSeat) {

        pSeat.innerText =
            student.seatID || "-";

    }


    /* ================================================
       SECRET
    ================================================= */

    const pSecret =
        document.getElementById(
            "pSecret"
        );


    if (pSecret) {

        pSecret.innerText =
            student.secretID || "-";

    }


    /* ================================================
       TABLE
    ================================================= */

    const tableBody =
        document.getElementById(
            "pTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML =
        "";


    const scores =
        student.scores &&
        typeof student.scores === "object"
            ? student.scores
            : {};


    let columns =
        [];


    if (
        currentGradeSettings &&
        Array.isArray(
            currentGradeSettings.displayColumns
        ) &&
        currentGradeSettings.displayColumns.length
    ) {

        columns =
            currentGradeSettings.displayColumns;

    }

    else {

        columns =
            Object.keys(
                scores
            );

    }


    /* ================================================
       TABLE ROWS
    ================================================= */

    columns.forEach(
        function (column) {

            let score =
                "-";


            if (
                Object.prototype.hasOwnProperty.call(
                    scores,
                    column
                )
            ) {

                const value =
                    scores[column];


                if (
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
                ) {

                    score =
                        value;

                }

            }


            tableBody.innerHTML += `

                <tr>

                    <td
                        style="font-weight:700;"
                    >
                        ${escapeHTML(column)}
                    </td>

                    <td
                        style="font-weight:900; color:#1e3a8a;"
                    >
                        ${escapeHTML(score)}
                    </td>

                </tr>

            `;

        }
    );


    /* ================================================
       PRINT
    ================================================= */

    setTimeout(
        function () {

            window.print();

        },
        100
    );

}


/* ============================================================
   STATUS NOTICE
   ============================================================ */

function showStatusNotice(
    title,
    message,
    isReady = false
) {

    const notice =
        document.getElementById(
            "statusNotice"
        );


    const titleElement =
        document.getElementById(
            "statusTitle"
        );


    const messageElement =
        document.getElementById(
            "statusMsg"
        );


    if (
        !notice ||
        !titleElement ||
        !messageElement
    ) {

        return;

    }


    titleElement.innerText =
        title;


    messageElement.innerText =
        message;


    /* ================================================
       READY
    ================================================= */

    if (isReady) {

        notice.classList.add(
            "border-emerald-500/30"
        );


        titleElement.className =
            "text-2xl font-black text-emerald-400";

    }


    /* ================================================
       NOT READY
    ================================================= */

    else {

        notice.classList.remove(
            "border-emerald-500/30"
        );


        titleElement.className =
            "text-3xl font-black text-amber-400";

    }


    notice.classList.remove(
        "hidden"
    );

}


/* ============================================================
   RESET ALL VIEWS
   ============================================================ */

function resetViews() {

    const elements = [

        "statusNotice",

        "resultCard",

        "paymentNotice",

        "notFoundNotice",

        "withheldNotice"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* ============================================================
   RESET SEARCH
   ============================================================ */

function resetSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value =
            "";

    }


    currentStudentData =
        null;


    resetViews();


    checkGradeStatus();

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   EXPORT FUNCTIONS
   احتياطي لو عندك أي كود خارجي يستدعيها
   ============================================================ */

window.checkGradeStatus =
    checkGradeStatus;


window.handleSearch =
    handleSearch;


window.displayResult =
    displayResult;


window.printStudentCertificate =
    printStudentCertificate;


window.resetViews =
    resetViews;


window.resetSearch =
    resetSearch;
