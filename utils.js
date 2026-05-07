// تحويل الأرقام إلى (١، ٢، ٣) لضمان الاحترافية
export const toArabicNum = (n) => {
    if (n === null || n === undefined) return "٠";
    return n.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
};

// وظيفة رسم بياني بسيط لمستوى الطالب (باستخدام مكتبة Chart.js)
export const renderChart = (ctx, labels, data) => {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'درجات الطالب',
                data: data,
                backgroundColor: 'rgba(30, 58, 138, 0.7)', // لون كحلي عسكري
                borderColor: '#1e3a8a',
                borderWidth: 2
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
};
