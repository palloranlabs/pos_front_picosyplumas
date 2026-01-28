import React, { useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { formatCurrency, parseDecimal } from '../../utils/currency';
import { Button } from '../common/Button';
import { Trash2, Percent, Eye } from 'lucide-react';
import { DiscountModal } from './DiscountModal';
import { PayModal } from './PayModal';
import type { Product } from '../../types/models.types';
export const CartWidget: React.FC = () => {
    const { items, removeItem, updateQuantity, getMetaData, clearCart } = useCartStore();
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [viewImageProduct, setViewImageProduct] = useState<Product | null>(null);
    const [showPayModal, setShowPayModal] = useState(false);

    const { subtotal, total } = getMetaData();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Venta Actual</h2>
                {items.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 size={16} className="mr-1" /> Limpiar
                    </Button>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <p>Carrito vacío</p>
                        <p className="text-sm">Seleccione productos</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const price = parseDecimal(item.product.base_price);
                        const qty = parseDecimal(item.quantity);
                        const discount = parseDecimal(item.discount_percent);
                        const lineTotal = price * qty * (1 - discount / 100);

                        return (
                            <div key={item.product.id} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                                    <div className="flex items-center mt-1 space-x-2 text-sm">
                                        <span className="text-gray-500">${price.toFixed(2)} x</span>
                                        <input
                                            className="w-12 border rounded px-1 text-center"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product.id, e.target.value)}
                                        />
                                        {discount > 0 && (
                                            <span className="text-brand-green text-xs font-bold">-{discount}% CHECK</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-gray-900">{formatCurrency(lineTotal)}</span>
                                    <div className="flex space-x-1 mt-1">
                                        {item.product.image_url && (
                                            <button
                                                onClick={() => setViewImageProduct(item.product)}
                                                className="p-1 text-gray-400 hover:text-brand-blue"
                                                title="Ver Imagen"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedProductId(item.product.id)}
                                            className="p-1 text-gray-400 hover:text-brand-blue"
                                            title="Add Discount"
                                        >
                                            <Percent size={14} />
                                        </button>
                                        <button
                                            onClick={() => removeItem(item.product.id)}
                                            className="p-1 text-gray-400 hover:text-brand-red"
                                            title="Remove"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ... Footer ... */}
            <div className="p-4 bg-gray-50 border-t space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>

                <Button
                    className="w-full mt-4 bg-gradient-to-r from-brand-yellow to-brand-red py-4 text-xl font-bold shadow-lg transform active:scale-95 transition-all drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                    disabled={items.length === 0}
                    onClick={() => setShowPayModal(true)}
                >
                    PAGAR {formatCurrency(total)}
                </Button>
            </div>

            {/* Modals */}
            {selectedProductId && (
                <DiscountModal
                    productId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}

            {showPayModal && (
                <PayModal
                    total={total}
                    onClose={() => setShowPayModal(false)}
                />
            )}

            {viewImageProduct && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] cursor-pointer"
                    onClick={() => setViewImageProduct(null)}
                >
                    <div className="max-w-3xl max-h-[90vh] p-2 bg-white rounded-lg relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewImageProduct(null)} className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black text-white rounded-full"><Trash2 size={24} className="hidden" /><Eye size={24} className="hidden" />X</button>
                        <img src={viewImageProduct.image_url!} alt={viewImageProduct.name} className="max-w-full max-h-[85vh] object-contain" />
                        <p className="text-center font-bold mt-2">{viewImageProduct.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
