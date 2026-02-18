import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32 pb-20 min-h-screen bg-slate-50"
        >
            <SEO
                title="Terms & Conditions | Beyond Heaven"
                description="Read our terms and conditions, cancellation policy, and important notes regarding your stay at Beyond Heaven."
            />

            <div className="container-custom max-w-4xl mx-auto">
                <h1 className="text-4xl text-secondary mb-2 font-serif">Terms & Conditions</h1>
                <p className="text-gray-500 mb-12">Please read these policies carefully before booking.</p>

                <div className="space-y-12">
                    {/* Important Notes */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-secondary mb-6 font-serif border-b border-gray-100 pb-2">Important Notes</h2>
                        <ul className="space-y-3 text-gray-600 list-disc pl-5">
                            <li>No charges for postponing or date changing, if only informed 10 days prior.</li>
                            <li>We are not responsible for any climatic issues and natural calamities, you may postpone the date. In such cases refund is not applicable.</li>
                        </ul>
                    </section>

                    {/* Cancellation & Refund Policy */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-secondary mb-6 font-serif border-b border-gray-100 pb-2">Cancellation & Refund Policy</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">On the day of booking</span>
                                <span className="text-red-600 font-bold">No refund</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">01-07 days</span>
                                <span className="text-red-600 font-bold">No refund</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">07-15 days</span>
                                <span className="text-orange-600 font-bold">25% refund</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">15-30 days</span>
                                <span className="text-yellow-600 font-bold">50% refund</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">More than 50 days</span>
                                <span className="text-green-600 font-bold">Full refund</span>
                            </div>
                        </div>
                    </section>

                    {/* Terms & Conditions */}
                    <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl text-secondary mb-6 font-serif border-b border-gray-100 pb-2">General Terms & Conditions</h2>
                        <ul className="space-y-4 text-gray-600 text-sm leading-relaxed list-disc pl-5">
                            <li>At the time of Check-In the balance amount must be paid fully.</li>
                            <li>Current government regulations require Indian residents to present proof of identity at the time of check-in. The proof of identity can be the guest's Aadhar, driving license, passport or voter's identity.</li>
                            <li>For any early Check-out there will be one night early check-out penalty to be imposed. In an event of a guest No show, a fee of one night's rate will be charged.</li>
                            <li>Early Check-in or Late Check-out is subjected to availability on the relevant day, to be reconfirmed with the staff in charge.</li>
                            <li>A levy is chargeable for early check-In and late Check-Out.</li>
                            <li>Room not occupied by 22 hours will be seen as No Show, unless prior arrangement has been made.</li>
                            <li>For peak Season, all reservations payments are non-refundable.</li>
                            <li>Extra charges are not applicable for kids below 5 years. 5 years to 10 years we are charging half payment, and above 10 years full payment will be charged.</li>
                            <li>Extra Mattress would be chargeable.</li>
                            <li>Our sales team reserves the right of last-minute price change. This does not affect any previous booking.</li>
                            <li>We are strictly against using drugs in our premises, any guest found in possession of any kind of drugs other than medical need would be reported to local police. In addition their whole booking stand cancelled without refunds.</li>
                            <li>If in any case the number of people arriving for a package is reduced, there will be no change in the amount at the time of booking, but if the number of people increases an additional amount will be charged for each additional person.</li>
                            <li>Our team is not responsible or liable for any losses of gold, cash, valued items, and personal items, and also not liable for any losses caused by acts of God, war, accidents, visa issues or any event beyond our control.</li>
                            <li>Pets not allowed.</li>
                            <li>No loud music.</li>
                            <li>Pool will be available till 7 pm (Only applicable for pool available resorts).</li>
                            <li>Meal plan cp - refers to Continental plan where breakfast is complimentary.</li>
                            <li>Swiping machine facility is not available at resorts. Payment has to be done through cash or GPay/UPI.</li>
                            <li>Extra paid food items will be provided at resorts as per demand. Need to inform at least three days prior for arrangements.</li>
                        </ul>
                    </section>

                    <div className="text-center text-gray-500 text-sm mt-12 bg-white p-6 rounded-xl border border-gray-100">
                        <p className="font-medium text-secondary mb-2">Thank you for choosing our services.</p>
                        <p>Best Regards,</p>
                        <p className="font-serif text-lg text-primary mt-1">Beyond Heaven Team</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TermsAndConditions;
