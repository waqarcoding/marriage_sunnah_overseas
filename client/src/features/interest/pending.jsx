import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';

export default function PendingApprovalsRows() {
    const [requests, setRequests] = useState([
        {
            id: 1,
            from: 'John Doe',
            fromImg: 'https://i.pravatar.cc/40?img=1',
            to: 'Alice Smith',
            toImg: 'https://i.pravatar.cc/40?img=2',
            guardianApproved: false,
            message: 'Interested in connecting',
        },
        {
            id: 2,
            from: 'Ali Khan',
            fromImg: 'https://i.pravatar.cc/40?img=3',
            to: 'Sara Ahmed',
            toImg: 'https://i.pravatar.cc/40?img=4',
            guardianApproved: true,
            message: 'Looking for marriage proposal',
        },
        {
            id: 3,
            from: 'Ahmed Raza',
            fromImg: 'https://i.pravatar.cc/40?img=5',
            to: 'Fatima Noor',
            toImg: 'https://i.pravatar.cc/40?img=6',
            guardianApproved: false,
            message: 'Interest request pending',
        },
    ]);

    const handleAction = (id, action) => {
        const request = requests.find((r) => r.id === id);

        if (!request.guardianApproved && action !== 'requestInfo') {
            toast.error('Guardian approval is required before this action!');
            return;
        }

        let msg = '';
        if (action === 'accept') msg = `${request.from}'s interest accepted!`;
        if (action === 'decline') msg = `${request.from}'s interest declined!`;
        if (action === 'requestInfo') msg = `Requested more info from ${request.from}`;

        toast.success(msg);

        if (action === 'accept' || action === 'decline') {
            setRequests(requests.filter((r) => r.id !== id));
        }
    };

    return (
        <div className="space-y-6 p-4">


            <h1 className="text-3xl font-bold text-gray-800 mb-4">Pending Interest Requests</h1>
            <p className="text-gray-600 mb-6">
                Review interest requests. Guardian approval is required before accepting or declining.
            </p>

            <div className="space-y-4">
                {requests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No pending requests</p>
                )}

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between hover:bg-white/30 transition"
                    >
                        {/* From and To */}
                        <div className="flex items-center space-x-4 mb-2 md:mb-0">
                            <div className="flex items-center space-x-2">
                                <img
                                    src={req.fromImg}
                                    alt={req.from}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-gray-800">{req.from}</span>
                            </div>
                            <span className="text-gray-500">→</span>
                            <div className="flex items-center space-x-2">
                                <img
                                    src={req.toImg}
                                    alt={req.to}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-gray-800">{req.to}</span>
                            </div>
                        </div>

                        {/* Message */}
                        <p className="text-gray-600 flex-1 text-sm md:mx-4">{req.message}</p>

                        {/* Status + Actions */}
                        <div className="flex items-center space-x-2 mt-2 md:mt-0">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${req.guardianApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {req.guardianApproved ? 'Approved' : 'Pending'}
                            </span>

                            <button
                                onClick={() => handleAction(req.id, 'accept')}
                                className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                                <FiCheck className="mr-1" /> Accept
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'decline')}
                                className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                                <FiX className="mr-1" /> Decline
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'requestInfo')}
                                className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                            >
                                <FiInfo className="mr-1" /> Info
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
