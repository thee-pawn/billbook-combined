import { Button } from 'antd';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import StaffSalary from './StaffSalary';

// Mock data for employees and their salary records with more details for payslip
const mockEmployees = [
    { id: 'emp001', name: 'Alice Johnson', fatherName: 'Robert Johnson', pan: 'ABCDE1234F', joiningDate: '01-01-2023', pfNo: 'PF12345', esiNo: 'ESI67890' },
    { id: 'emp002', name: 'Bob Williams', fatherName: 'David Williams', pan: 'FGHIJ5678K', joiningDate: '15-03-2022', pfNo: 'PF54321', esiNo: 'ESI09876' },
    { id: 'emp003', name: 'Charlie Brown', fatherName: 'Peanut Brown', pan: 'KLMNO9012P', joiningDate: '01-07-2023', pfNo: 'PF98765', esiNo: 'ESI43210' },
];

const mockSalaryRecords = {
    'emp001': [
        {
            id: 'ps001_01', month: 'April', year: 2008, workingDays: 30.0, payPayableDays: 30.0,
            grossPay: 5000, netPay: 4500,
            earnings: {
                basicSalary: { scale: '###', amount: 3000 },
                hra: { scale: '###', amount: 1000 },
                conveyanceAllowance: { scale: '###', amount: 500 },
                medicalAllowance: { scale: '###', amount: 500 },
                leaveTravelAllowance: { scale: '-', amount: 0 },
                specialAllowance: { scale: '-', amount: 0 },
                educationalAllowance: { scale: '-', amount: 0 },
                bonus: { scale: '-', amount: 0 },
                exGratia: { scale: '-', amount: 0 },
            },
            deductions: {
                pf: { scale: '###', amount: 250 },
                esi: { scale: '###', amount: 100 },
                professionalTax: { scale: '###', amount: 50 },
                tds: { scale: '###', amount: 100 },
                advance: { scale: '-', amount: 0 },
            },
            netPayInWords: 'RUPEES: FOUR THOUSAND FIVE HUNDRED ONLY.',
            tdsDeductedUpto: 'Apr/2008 NIL',
            companyDetails: {
                name: 'ABC Corp',
                address: '123 Business Park, City, Country',
                logo: 'https://placehold.co/150x50/14b8a6/ffffff?text=COMPANY+LOGO' // Placeholder for company logo
            },
            branch: 'Main Branch',
            designation: 'Software Engineer',
            department: 'Engineering',
            payMode: 'Bank Transfer',
            bankName: 'Bank of React',
            accountNo: '1234567890',
        },
        {
            id: 'ps001_02', month: 'May', year: 2008, workingDays: 31.0, payPayableDays: 31.0,
            grossPay: 5000, netPay: 4500,
            earnings: {
                basicSalary: { scale: '###', amount: 3000 },
                hra: { scale: '###', amount: 1000 },
                conveyanceAllowance: { scale: '###', amount: 500 },
                medicalAllowance: { scale: '###', amount: 500 },
                leaveTravelAllowance: { scale: '-', amount: 0 },
                specialAllowance: { scale: '-', amount: 0 },
                educationalAllowance: { scale: '-', amount: 0 },
                bonus: { scale: '-', amount: 0 },
                exGratia: { scale: '-', amount: 0 },
            },
            deductions: {
                pf: { scale: '###', amount: 250 },
                esi: { scale: '###', amount: 100 },
                professionalTax: { scale: '###', amount: 50 },
                tds: { scale: '###', amount: 100 },
                advance: { scale: '-', amount: 0 },
            },
            netPayInWords: 'RUPEES: FOUR THOUSAND FIVE HUNDRED ONLY.',
            tdsDeductedUpto: 'May/2008 NIL',
            companyDetails: {
                name: 'ABC Corp',
                address: '123 Business Park, City, Country',
                logo: 'https://placehold.co/150x50/14b8a6/ffffff?text=COMPANY+LOGO'
            },
            branch: 'Main Branch',
            designation: 'Software Engineer',
            department: 'Engineering',
            payMode: 'Bank Transfer',
            bankName: 'Bank of React',
            accountNo: '1234567890',
        },
    ],
    'emp002': [
        {
            id: 'ps002_01', month: 'April', year: 2008, workingDays: 30.0, payPayableDays: 30.0,
            grossPay: 6000, netPay: 5400,
            earnings: {
                basicSalary: { scale: '###', amount: 4000 },
                hra: { scale: '###', amount: 1200 },
                conveyanceAllowance: { scale: '###', amount: 600 },
                medicalAllowance: { scale: '###', amount: 200 },
                leaveTravelAllowance: { scale: '-', amount: 0 },
                specialAllowance: { scale: '-', amount: 0 },
                educationalAllowance: { scale: '-', amount: 0 },
                bonus: { scale: '-', amount: 0 },
                exGratia: { scale: '-', amount: 0 },
            },
            deductions: {
                pf: { scale: '###', amount: 300 },
                esi: { scale: '###', amount: 150 },
                professionalTax: { scale: '###', amount: 80 },
                tds: { scale: '###', amount: 70 },
                advance: { scale: '-', amount: 0 },
            },
            netPayInWords: 'RUPEES: FIVE THOUSAND FOUR HUNDRED ONLY.',
            tdsDeductedUpto: 'Apr/2008 NIL',
            companyDetails: {
                name: 'XYZ Inc.',
                address: '456 Tech Avenue, Town, Country',
                logo: 'https://placehold.co/150x50/14b8a6/ffffff?text=COMPANY+LOGO'
            },
            branch: 'North Branch',
            designation: 'Senior Developer',
            department: 'Development',
            payMode: 'Bank Transfer',
            bankName: 'Global Bank',
            accountNo: '9876543210',
        },
    ],
    'emp003': [
        {
            id: 'ps003_01', month: 'April', year: 2008, workingDays: 30.0, payPayableDays: 30.0,
            grossPay: 4500, netPay: 4050,
            earnings: {
                basicSalary: { scale: '###', amount: 2800 },
                hra: { scale: '###', amount: 900 },
                conveyanceAllowance: { scale: '###', amount: 400 },
                medicalAllowance: { scale: '###', amount: 400 },
                leaveTravelAllowance: { scale: '-', amount: 0 },
                specialAllowance: { scale: '-', amount: 0 },
                educationalAllowance: { scale: '-', amount: 0 },
                bonus: { scale: '-', amount: 0 },
                exGratia: { scale: '-', amount: 0 },
            },
            deductions: {
                pf: { scale: '###', amount: 200 },
                esi: { scale: '###', amount: 80 },
                professionalTax: { scale: '###', amount: 40 },
                tds: { scale: '###', amount: 130 },
                advance: { scale: '-', amount: 0 },
            },
            netPayInWords: 'RUPEES: FOUR THOUSAND FIFTY ONLY.',
            tdsDeductedUpto: 'Apr/2008 NIL',
            companyDetails: {
                name: 'PQR Solutions',
                address: '789 Innovation Drive, Metro, Country',
                logo: 'https://placehold.co/150x50/14b8a6/ffffff?text=COMPANY+LOGO'
            },
            branch: 'South Branch',
            designation: 'Junior Analyst',
            department: 'Analytics',
            payMode: 'Bank Transfer',
            bankName: 'City Bank',
            accountNo: '1122334455',
        },
    ],
};


// PayslipDisplay Component
const PayslipDisplay = ({ payslipData, onBack, isHtml2CanvasLoaded }) => {
    const payslipRef = useRef(null);

    const handleDownloadImage = useCallback(async () => {
        if (!isHtml2CanvasLoaded || typeof window.html2canvas === 'undefined') {
            console.error('html2canvas library not loaded. Cannot download image.');
            return;
        }

        if (payslipRef.current) {
            try {
                const canvas = await window.html2canvas(payslipRef.current, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `Payslip_${payslipData.employeeName.replace(/\s/g, '_')}_${payslipData.month}_${payslipData.year}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error generating payslip image:', error);
            }
        }
    }, [payslipData, isHtml2CanvasLoaded]);

    if (!payslipData) {
        return null;
    }

    return (
        <div className="p-6 bg-white max-w-4xl my-8 ">
            <div className="flex items-center mb-4">
                <button
                    onClick={onBack}
                    className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 mr-4"
                    aria-label="Back to Records"
                >
                    {/* Left arrow SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>
                <p className="text-xl font-bold text-teal-700">Payslip Details</p>
            </div>

            <div ref={payslipRef} className="payslip-content p-4">
                {/* Company Header */}
                <div className="text-center mb-6">

                    <h2 className="text-3xl font-bold text-teal-700">{payslipData.companyDetails.name}</h2>
                    <p className="text-sm text-gray-600">{payslipData.companyDetails.address}</p>
                    <p className="text-lg font-semibold mt-4 text-teal-800">
                        PAY SLIP For the Month of {payslipData.month}/{payslipData.year} (From 01-{payslipData.month}-{payslipData.year} To {payslipData.payPayableDays}-{payslipData.month}-{payslipData.year})
                    </p>
                </div>

                {/* Employee Details Section */}
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 p-4 bg-white rounded-md border border-teal-200 mb-6">
                    <div><span className="font-semibold text-teal-700">Working Days:</span> {payslipData.workingDays}</div>
                    <div><span className="font-semibold text-teal-700">Pay Payable Days:</span> {payslipData.payPayableDays}</div>
                    <div><span className="font-semibold text-teal-700">Employee Name:</span> {payslipData.employeeName}</div>
                    <div><span className="font-semibold text-teal-700">Branch:</span> {payslipData.branch}</div>
                    <div><span className="font-semibold text-teal-700">Father's Name:</span> {payslipData.fatherName}</div>
                    <div><span className="font-semibold text-teal-700">Designation:</span> {payslipData.designation}</div>
                    <div><span className="font-semibold text-teal-700">PAN:</span> {payslipData.pan}</div>
                    <div><span className="font-semibold text-teal-700">Department:</span> {payslipData.department}</div>
                    <div><span className="font-semibold text-teal-700">Joining Date:</span> {payslipData.joiningDate}</div>
                    <div><span className="font-semibold text-teal-700">Pay Mode:</span> {payslipData.payMode}</div>
                    <div><span className="font-semibold text-teal-700">PF No:</span> {payslipData.pfNo}</div>
                    <div><span className="font-semibold text-teal-700">Bank Name:</span> {payslipData.bankName}</div>
                    <div><span className="font-semibold text-teal-700">ESI No:</span> {payslipData.esiNo}</div>
                    <div><span className="font-semibold text-teal-700">Account No.:</span> {payslipData.accountNo}</div>
                </div>

                {/* Earnings and Deductions Table */}
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden border border-teal-300">
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="py-2 px-3 text-left text-sm font-semibold uppercase tracking-wider w-1/4">Earnings</th>
                                <th className="py-2 px-3 text-center text-sm font-semibold uppercase tracking-wider w-1/8">Scale</th>
                                <th className="py-2 px-3 text-center text-sm font-semibold uppercase tracking-wider w-1/8">Amount</th>
                                <th className="py-2 px-3 text-left text-sm font-semibold uppercase tracking-wider w-1/4">Deductions</th>
                                <th className="py-2 px-3 text-center text-sm font-semibold uppercase tracking-wider w-1/8">Scale</th>
                                <th className="py-2 px-3 text-center text-sm font-semibold uppercase tracking-wider w-1/8">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Map through a combined list for rows */}
                            {Array.from({ length: Math.max(Object.keys(payslipData.earnings).length, Object.keys(payslipData.deductions).length) }).map((_, index) => {
                                const earningKey = Object.keys(payslipData.earnings)[index];
                                const deductionKey = Object.keys(payslipData.deductions)[index];
                                const earning = earningKey ? payslipData.earnings[earningKey] : null;
                                const deduction = deductionKey ? payslipData.deductions[deductionKey] : null;

                                const formatLabel = (key) => {
                                    if (!key) return '';
                                    return key.replace(/([A-Z])/g, ' $1').toUpperCase();
                                };

                                return (
                                    <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 last:border-b-0`}>
                                        <td className="py-2 px-3 text-teal-800">{earning ? formatLabel(earningKey) : ''}</td>
                                        <td className="py-2 px-3 text-center text-teal-800">{earning ? earning.scale : ''}</td>
                                        <td className="py-2 px-3 text-center text-teal-800">{earning ? earning.amount.toFixed(2) : ''}</td>
                                        <td className="py-2 px-3 text-teal-800">{deduction ? formatLabel(deductionKey) : ''}</td>
                                        <td className="py-2 px-3 text-center text-teal-800">{deduction ? deduction.scale : ''}</td>
                                        <td className="py-2 px-3 text-center text-teal-800">{deduction ? deduction.amount.toFixed(2) : ''}</td>
                                    </tr>
                                );
                            })}
                            {/* Totals Row */}
                            <tr className="bg-teal-600 text-white font-bold">
                                <td className="py-2 px-3">Total</td>
                                <td className="py-2 px-3 text-center"></td>
                                <td className="py-2 px-3 text-center">{Object.values(payslipData.earnings).reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</td>
                                <td className="py-2 px-3">Total</td>
                                <td className="py-2 px-3 text-center"></td>
                                <td className="py-2 px-3 text-center">{Object.values(payslipData.deductions).reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Net Pay and Signatory Section */}
                <div className="p-4 bg-white rounded-md border border-teal-200 mb-6">
                    <p className="text-xl font-bold text-teal-900 mb-2">Net Pay : ${payslipData.netPay.toFixed(2)}</p>
                    <p className="text-base text-teal-800">In Words : {payslipData.netPayInWords}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-md border border-teal-200 mb-6">
                    <div>
                        <p className="text-sm text-teal-700">TDS Deducted Upto {payslipData.tdsDeductedUpto}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-semibold text-teal-800">NAME</p>
                        <p className="text-sm text-gray-600">Authorised Signatory</p>
                    </div>
                </div>
            </div> {/* End of payslip-content div */}

            <div className="flex justify-center gap-4">
                <button
                    onClick={handleDownloadImage}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-down"><path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10.3" /><path d="m7 10 2.3 2.3a1 1 0 0 0 1.4 0L16 7" /><path d="m22 17-3 3-3-3" /><path d="M19 22V17" /></svg>
                    Download Image
                </button>
            </div>
        </div>
    );
};

// EmployeeSalaryRecord Component
const EmployeeSalaryRecord = ({ employee, onViewPayslip, onBackToList }) => {
    const records = mockSalaryRecords[employee.id] || [];

    return (
        <div className=" my-8 ">
            <div className="flex flex-row justify-between items-center mb-4">
                <button
                    onClick={onBackToList}
                    className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 mr-4"
                    aria-label="Back to Employee List"
                >
                    {/* Left arrow SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                </button>

            </div>

            {records.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-teal-600 text-white">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">Month</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Year</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider">Net Pay</th>
                                <th className="py-3 px-4 text-center text-sm font-semibold uppercase tracking-wider rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => {
                                const totalDeductions = Object.values(record.deductions).reduce((sum, item) => sum + item.amount, 0);

                                return (
                                    <tr key={record.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 last:border-b-0`}>
                                        <td className="py-3 px-4 text-teal-800">{record.month}</td>
                                        <td className="py-3 px-4 text-teal-800">{record.year}</td>
                                        <td className="py-3 px-4 text-teal-800 font-medium">${record.netPay.toFixed(2)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <button
                                                onClick={() => onViewPayslip({
                                                    ...record,
                                                    employeeName: employee.name,
                                                    fatherName: employee.fatherName,
                                                    pan: employee.pan,
                                                    joiningDate: employee.joiningDate,
                                                    pfNo: employee.pfNo,
                                                    esiNo: employee.esiNo,
                                                    deductions: totalDeductions
                                                })}
                                                className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-1.5 px-4 rounded-md shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
                                            >
                                                View Payslip
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-600 text-lg py-8">No salary records found for {employee.name}.</p>
            )}
        </div>
    );
};

// Main App Component
export default function StaffSalaryData() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedPayslipData, setSelectedPayslipData] = useState(null);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(false);
    const [isHtml2CanvasLoaded, setIsHtml2CanvasLoaded] = useState(false);

    useEffect(() => {
        const scriptId = 'html2canvasScript';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.async = true;
            document.body.appendChild(script);
            script.onload = () => {
                setIsHtml2CanvasLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load html2canvas script.');
                setIsHtml2CanvasLoaded(false);
            };
        } else if (typeof window.html2canvas !== 'undefined') {
            setIsHtml2CanvasLoaded(true);
        }
    }, []);

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setSelectedPayslipData(null);
    };

    const handleViewPayslip = (payslip) => {
        setSelectedPayslipData(payslip);
    };

    const handleBackToRecords = () => {
        setSelectedPayslipData(null);
    };

    const handleBackToList = () => {
        setSelectedEmployee(null);
        setSelectedPayslipData(null);
    };

    return (
        <div className=" font-sans antialiased">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
            <script src="https://cdn.tailwindcss.com"></script>


            <main className="container mx-auto mt-4">

                {selectedPayslipData ? (
                    <PayslipDisplay
                        payslipData={selectedPayslipData}
                        onBack={handleBackToRecords}
                        isHtml2CanvasLoaded={isHtml2CanvasLoaded}
                    />
                ) : selectedPaymentDetails ? (
                    <div>
                        <button className='p-2 rounded-md bg-teal-500 hover:bg-teal-700 text-teal-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 mr-4 text-white font-semibold'
                            onClick={() => setSelectedPaymentDetails(false)}
                        >
                            Hide Salary details
                        </button>
                        <StaffSalary />
                    </div>
                ) : (
                    <div>
                        <button className='p-2 rounded-md bg-teal-500 hover:bg-teal-700 text-teal-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 mr-4 text-white font-semibold'
                            onClick={() => setSelectedPaymentDetails(true)}
                        >
                            Salary details
                        </button>
                        <EmployeeSalaryRecord
                            employee={mockEmployees[0]}
                            onViewPayslip={handleViewPayslip}
                            onBackToList={handleBackToList}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
