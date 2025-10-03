import React from 'react';
import { Upload, Download, FileText, Users, School, AlertCircle, CheckCircle, XCircle, Plus, Trash2, Edit } from 'lucide-react';

function PSDBulkOperations() {
    const [selectedOperation, setSelectedOperation] = React.useState('import');
    const [uploadedFile, setUploadedFile] = React.useState(null);
    const [operationStatus, setOperationStatus] = React.useState('idle');
    const [results, setResults] = React.useState(null);

    const operations = [
        {
            id: 'import',
            title: 'Import Schools',
            description: 'Import school data from CSV/Excel files',
            icon: Upload,
            color: 'blue'
        },
        {
            id: 'export',
            title: 'Export Data',
            description: 'Export school data to various formats',
            icon: Download,
            color: 'green'
        },
        {
            id: 'bulk-edit',
            title: 'Bulk Edit',
            description: 'Edit multiple schools at once',
            icon: Edit,
            color: 'orange'
        },
        {
            id: 'bulk-delete',
            title: 'Bulk Delete',
            description: 'Delete multiple schools',
            icon: Trash2,
            color: 'red'
        }
    ];

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
            setOperationStatus('processing');
            // Simulate processing
            setTimeout(() => {
                setOperationStatus('completed');
                setResults({
                    total: 100,
                    successful: 95,
                    failed: 5,
                    errors: ['Invalid email format', 'Missing required field', 'Duplicate entry', 'Invalid phone number', 'Invalid date format']
                });
            }, 2000);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'idle': return <FileText className="w-5 h-5 text-gray-400" />;
            case 'processing': return <AlertCircle className="w-5 h-5 text-yellow-500 animate-spin" />;
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Operations</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Perform bulk operations on partner school data</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Operation Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {operations.map((operation) => (
                        <button
                            key={operation.id}
                            onClick={() => setSelectedOperation(operation.id)}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                                selectedOperation === operation.id
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-600'
                            }`}
                        >
                            <div className="flex items-center mb-3">
                                <div className={`p-3 rounded-lg ${
                                    operation.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                                    operation.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                                    operation.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                                    'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                    <operation.icon className={`w-6 h-6 ${
                                        operation.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                        operation.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                        operation.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                        'text-red-600 dark:text-red-400'
                                    }`} />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{operation.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400">{operation.description}</p>
                        </button>
                    ))}
                </div>

                {/* Operation Content */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    {selectedOperation === 'import' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Import School Data</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                    Upload a CSV or Excel file to import school data. Make sure your file follows the required format.
                                </p>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        {uploadedFile ? `Selected: ${uploadedFile.name}` : 'Click to upload or drag and drop'}
                                    </p>
                                    <input
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                    </label>
                                </div>
                            </div>

                            {operationStatus === 'processing' && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                                        <span className="text-sm text-yellow-800 dark:text-yellow-200">Processing file...</span>
                                    </div>
                                </div>
                            )}

                            {operationStatus === 'completed' && results && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                            <span className="text-sm text-green-800 dark:text-green-200">Import completed successfully!</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{results.total}</div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400">Total Records</div>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{results.successful}</div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400">Successful</div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{results.failed}</div>
                                            <div className="text-sm text-gray-600 dark:text-slate-400">Failed</div>
                                        </div>
                                    </div>

                                    {results.errors.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Errors:</h4>
                                            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                                {results.errors.map((error, index) => (
                                                    <li key={index} className="flex items-center">
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        {error}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedOperation === 'export' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Export School Data</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                    Export school data in various formats for analysis or backup purposes.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center mb-2">
                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                        <span className="font-medium text-gray-900 dark:text-white">CSV Format</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Export all school data as CSV</p>
                                </button>
                                <button className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center mb-2">
                                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                        <span className="font-medium text-gray-900 dark:text-white">Excel Format</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Export with formatting and charts</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedOperation === 'bulk-edit' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bulk Edit Schools</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                    Select multiple schools and apply changes to all of them at once.
                                </p>
                            </div>

                            <div className="text-center py-8">
                                <Edit className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Bulk Edit Interface</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    This feature will be implemented to allow bulk editing of school data.
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedOperation === 'bulk-delete' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bulk Delete Schools</h3>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                                    Select multiple schools to delete. This action cannot be undone.
                                </p>
                            </div>

                            <div className="text-center py-8">
                                <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Bulk Delete Interface</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    This feature will be implemented to allow bulk deletion of school data.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PSDBulkOperations;
