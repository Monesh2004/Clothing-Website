import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';

const SizeManagement = ({ formData, setFormData }) => {
  const [sizeData, setSizeData] = useState(
    ['S', 'M', 'L', 'XL', 'XXL'].map(name => ({
      name,
      stock: 0
    }))
  );

  useEffect(() => {
    if (formData?.sizes?.length > 0) {
      setSizeData(formData.sizes);
    }
  }, [formData?.sizes]);

  const handleStockChange = (name, value) => {
    const stock = parseInt(value) || 0;
    if (stock < 0) return;

    const newSizes = sizeData.map(size =>
      size.name === name ? { ...size, stock } : size
    );

    setSizeData(newSizes);
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
  };

  const distributeStock = (totalStock) => {
    const sizeCount = sizeData.length;
    const baseStock = Math.floor(totalStock / sizeCount);
    const remainder = totalStock % sizeCount;

    const newSizes = sizeData.map((size, index) => ({
      ...size,
      stock: baseStock + (index < remainder ? 1 : 0)
    }));

    setSizeData(newSizes);
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
    toast.success('Stock distributed evenly across sizes');
  };

  const shuffleStock = () => {
    const totalStock = sizeData.reduce((sum, size) => sum + size.stock, 0);
    if (totalStock === 0) {
      toast.error('No stock to shuffle');
      return;
    }

    let remaining = totalStock;
    const newSizes = [...sizeData].map((size, index, array) => {
      if (index === array.length - 1) {
        return { ...size, stock: remaining };
      }
      const maxForThisSize = Math.floor(remaining * Math.random());
      remaining -= maxForThisSize;
      return { ...size, stock: maxForThisSize };
    });

    setSizeData(newSizes);
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
    toast.success('Stock shuffled randomly across sizes');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Size Management</Label>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const total = sizeData.reduce((sum, size) => sum + size.stock, 0);
              distributeStock(total);
            }}
          >
            Distribute Evenly
          </Button>
          <Button 
            variant="outline"
            onClick={shuffleStock}
          >
            Shuffle Stock
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {sizeData.map((size) => (
          <div key={size.name} className="space-y-2">
            <Label>{size.name}</Label>
            <Input
              type="number"
              min="0"
              value={size.stock}
              onChange={(e) => handleStockChange(size.name, e.target.value)}
              className="w-full"
            />
          </div>
        ))}
      </div>
      
      <div className="text-sm text-gray-500">
        Total Stock: {sizeData.reduce((sum, size) => sum + size.stock, 0)}
      </div>
    </div>
  );
};

export default SizeManagement;