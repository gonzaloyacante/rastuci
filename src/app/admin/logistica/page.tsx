"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  isActive: boolean;
  paymentTerms: string;
  leadTime: number;
  totalOrders: number;
  onTimeDelivery: number;
  createdAt: string;
  updatedAt: string;
}

interface OptimizedRoute {
  id: string;
  date: string;
  region: string;
  vehicleType: string;
  driver: string;
  orders: Array<{
    orderId: string;
    customerName: string;
    address: string;
    priority: string;
    estimatedTime: string;
    status: string;
  }>;
  totalDistance: number;
  estimatedDuration: string;
  fuelCost: number;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  returnType: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    condition?: string;
  }>;
  customerReason: string;
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

const LogisticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'routes' | 'returns'>('suppliers');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Nuevos formularios
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    rating: 5,
    paymentTerms: '',
    leadTime: 7
  });

  const [newRouteOptimization, setNewRouteOptimization] = useState({
    deliveryDate: '',
    region: '',
    vehicleType: 'auto' as 'moto' | 'auto' | 'camion',
    priority: 'standard' as 'standard' | 'express' | 'urgent'
  });

  const supplierStatusColors = {
    active: 'badge-success',
    inactive: 'badge-error'
  };

  const routeStatusColors = {
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'badge-success'
  };

  const returnStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'badge-success'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case 'suppliers':
            await fetchSuppliers();
            break;
          case 'routes':
            await fetchRoutes();
            break;
          case 'returns':
            await fetchReturns();
            break;
        }
      } catch {
        // Error logging removed for production
      }
    };
    
    fetchData();
  }, [activeTab]);

  const _fetchLogisticsData = async (): Promise<void> => {
    try {
      switch (activeTab) {
        case 'suppliers':
          await fetchSuppliers();
          break;
        case 'routes':
          await fetchRoutes();
          break;
        case 'returns':
          await fetchReturns();
          break;
      }
    } catch {
      // Error logging removed for production
    }
  };

  const fetchSuppliers = async (): Promise<void> => {
    // Simular llamada API
    const mockSuppliers: Supplier[] = [
      {
        id: 'SUPP-001',
        name: 'Distribuidora Central',
        email: 'ventas@distribuidoracentral.com',
        phone: '+54 11 4567-8900',
        address: 'Av. Rivadavia 5000, CABA',
        category: 'Electrónicos',
        rating: 4.8,
        isActive: true,
        paymentTerms: '30 días',
        leadTime: 7,
        totalOrders: 156,
        onTimeDelivery: 94,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'SUPP-002',
        name: 'Textiles Premium SA',
        email: 'contacto@textilespremium.com',
        phone: '+54 11 4567-8901',
        address: 'Av. Warnes 1500, CABA',
        category: 'Indumentaria',
        rating: 4.6,
        isActive: true,
        paymentTerms: '15 días',
        leadTime: 5,
        totalOrders: 89,
        onTimeDelivery: 96,
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
    setSuppliers(mockSuppliers);
  };

  const fetchRoutes = async (): Promise<void> => {
    // Simular llamada API
    const mockRoutes: OptimizedRoute[] = [
      {
        id: 'ROUTE-001',
        date: '2024-01-16',
        region: 'CABA Norte',
        vehicleType: 'auto',
        driver: 'Juan Carlos Ruta',
        orders: [
          {
            orderId: 'ORD-001',
            customerName: 'Juan Pérez',
            address: 'Av. Corrientes 1000, CABA',
            priority: 'express',
            estimatedTime: '10:00 AM',
            status: 'pending'
          },
          {
            orderId: 'ORD-002',
            customerName: 'María García',
            address: 'Av. Santa Fe 2500, CABA',
            priority: 'standard',
            estimatedTime: '11:30 AM',
            status: 'pending'
          }
        ],
        totalDistance: 35,
        estimatedDuration: '3h 15m',
        fuelCost: 1800,
        status: 'planned',
        createdAt: '2024-01-15T16:30:00Z'
      }
    ];
    setRoutes(mockRoutes);
  };

  const fetchReturns = async (): Promise<void> => {
    // Simular llamada API
    const mockReturns: ReturnRequest[] = [
      {
        id: 'RET-001',
        orderId: 'ORD-123',
        customerEmail: 'cliente@example.com',
        status: 'pending',
        returnType: 'refund',
        items: [
          {
            productId: 'PROD-001',
            productName: 'Smartphone XZ',
            quantity: 1,
            reason: 'defective'
          }
        ],
        customerReason: 'El producto llegó con la pantalla rota',
        createdAt: '2024-01-15T14:30:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: 'RET-002',
        orderId: 'ORD-124',
        customerEmail: 'maria@example.com',
        status: 'approved',
        returnType: 'exchange',
        items: [
          {
            productId: 'PROD-002',
            productName: 'Remera Classic',
            quantity: 1,
            reason: 'wrong_item'
          }
        ],
        customerReason: 'Pedí talle M pero llegó talle S',
        adminNotes: 'Cambio aprobado, enviar talle correcto',
        refundAmount: 0,
        createdAt: '2024-01-14T16:20:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        approvedAt: '2024-01-15T09:15:00Z'
      }
    ];
    setReturns(mockReturns);
  };

  const createSupplier = async (): Promise<void> => {
    try {
      // Simular creación
      const createdSupplier: Supplier = {
        id: `SUPP-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        ...newSupplier,
        isActive: true,
        totalOrders: 0,
        onTimeDelivery: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSuppliers(prev => [createdSupplier, ...prev]);
      
      // Resetear formulario
      setNewSupplier({
        name: '',
        email: '',
        phone: '',
        address: '',
        category: '',
        rating: 5,
        paymentTerms: '',
        leadTime: 7
      });
    } catch {
      // Error logging removed for production
    }
  };

  const optimizeRoute = async (): Promise<void> => {
    try {
      // Simular optimización
      const optimizedRoute: OptimizedRoute = {
        id: `ROUTE-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        date: newRouteOptimization.deliveryDate,
        region: newRouteOptimization.region,
        vehicleType: newRouteOptimization.vehicleType,
        driver: 'Sistema Asignado',
        orders: [
          {
            orderId: `ORD-${Math.floor(Math.random() * 1000)}`,
            customerName: 'Cliente Ejemplo',
            address: 'Dirección de ejemplo',
            priority: newRouteOptimization.priority,
            estimatedTime: '10:00 AM',
            status: 'pending'
          }
        ],
        totalDistance: Math.floor(Math.random() * 50 + 20),
        estimatedDuration: '3h 45m',
        fuelCost: Math.floor(Math.random() * 2000 + 1000),
        status: 'planned',
        createdAt: new Date().toISOString()
      };

      setRoutes(prev => [optimizedRoute, ...prev]);
      
      // Resetear formulario
      setNewRouteOptimization({
        deliveryDate: '',
        region: '',
        vehicleType: 'auto',
        priority: 'standard'
      });
    } catch {
      // Error logging removed for production
    }
  };

  const updateReturnStatus = async (returnId: string, newStatus: ReturnRequest['status'], adminNotes?: string): Promise<void> => {
    try {
      setReturns(prev =>
        prev.map(ret =>
          ret.id === returnId
            ? {
                ...ret,
                status: newStatus,
                adminNotes: adminNotes || ret.adminNotes,
                updatedAt: new Date().toISOString(),
                approvedAt: newStatus === 'approved' ? new Date().toISOString() : ret.approvedAt,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : ret.completedAt
              }
            : ret
        )
      );
      
      if (selectedReturn?.id === returnId) {
        setSelectedReturn(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      // Error logging removed for production
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && supplier.isActive) ||
      (statusFilter === 'inactive' && !supplier.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = !searchTerm || 
      route.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredReturns = returns.filter(returnReq => {
    const matchesSearch = !searchTerm || 
      returnReq.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnReq.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || returnReq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Logística Avanzada</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'suppliers' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('suppliers')}
          >
            Proveedores ({suppliers.filter(s => s.isActive).length})
          </Button>
          <Button
            variant={activeTab === 'routes' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('routes')}
          >
            Rutas ({routes.filter(r => r.status !== 'completed').length})
          </Button>
          <Button
            variant={activeTab === 'returns' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('returns')}
          >
            Devoluciones ({returns.filter(r => r.status === 'pending').length})
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">Todos los estados</option>
            {activeTab === 'suppliers' && (
              <>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </>
            )}
            {activeTab === 'routes' && (
              <>
                <option value="planned">Planificadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
              </>
            )}
            {activeTab === 'returns' && (
              <>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="processing">En Proceso</option>
                <option value="completed">Completadas</option>
                <option value="rejected">Rechazadas</option>
              </>
            )}
          </select>
        </div>
      </Card>

      {/* Contenido según pestaña activa */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Proveedores */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Proveedores</h2>
              <Button onClick={() => setSelectedSupplier({} as Supplier)}>
                Nuevo Proveedor
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`p-3 border rounded-lg cursor-pointer surface-hover ${
                    selectedSupplier?.id === supplier.id ? 'border-primary bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{supplier.name}</h3>
                      <p className="text-sm text-content-secondary">{supplier.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={supplierStatusColors[supplier.isActive ? 'active' : 'inactive']}>
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <span className="text-sm">★ {supplier.rating}</span>
                        <span className="text-sm">{supplier.onTimeDelivery}% puntual</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detalle/Formulario del Proveedor */}
          <Card className="p-4">
            {selectedSupplier ? (
              selectedSupplier.id ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">{selectedSupplier.name}</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <p className="text-content-secondary">{selectedSupplier.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <p className="text-content-secondary">{selectedSupplier.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Dirección</label>
                      <p className="text-content-secondary">{selectedSupplier.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Términos de Pago</label>
                        <p className="text-content-secondary">{selectedSupplier.paymentTerms}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tiempo de Entrega</label>
                        <p className="text-content-secondary">{selectedSupplier.leadTime} días</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Total Órdenes</label>
                        <p className="text-content-secondary">{selectedSupplier.totalOrders}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Puntualidad</label>
                        <p className="text-content-secondary">{selectedSupplier.onTimeDelivery}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Nuevo Proveedor</h2>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nombre del proveedor"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                    <Input
                      placeholder="Teléfono"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                    <Input
                      placeholder="Dirección"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    />
                    <Input
                      placeholder="Categoría"
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                    />
                    <Input
                      placeholder="Términos de pago"
                      value={newSupplier.paymentTerms}
                      onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Tiempo de entrega (días)"
                      value={newSupplier.leadTime}
                      onChange={(e) => setNewSupplier({...newSupplier, leadTime: parseInt(e.target.value) || 7})}
                    />
                    <div className="flex gap-2">
                      <Button onClick={createSupplier}>Crear Proveedor</Button>
                      <Button variant="outline" onClick={() => setSelectedSupplier(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-content-tertiary">
                Selecciona un proveedor o crea uno nuevo
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Rutas */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Rutas Optimizadas</h2>
              <Button onClick={() => setSelectedRoute({} as OptimizedRoute)}>
                Optimizar Ruta
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 border rounded-lg cursor-pointer surface-hover ${
                    selectedRoute?.id === route.id ? 'border-primary bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{route.id} - {route.region}</h3>
                      <p className="text-sm text-content-secondary">
                        {route.driver} • {route.vehicleType}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={routeStatusColors[route.status]}>
                          {route.status}
                        </Badge>
                        <span className="text-sm">{route.orders.length} entregas</span>
                        <span className="text-sm">{route.totalDistance} km</span>
                      </div>
                    </div>
                    <span className="text-xs text-content-tertiary">
                      {new Date(route.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detalle/Formulario de Ruta */}
          <Card className="p-4">
            {selectedRoute ? (
              selectedRoute.id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{selectedRoute.id}</h2>
                    <Badge className={routeStatusColors[selectedRoute.status]}>
                      {selectedRoute.status}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Región</label>
                        <p className="text-content-secondary">{selectedRoute.region}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Fecha</label>
                        <p className="text-content-secondary">{selectedRoute.date}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Conductor</label>
                        <p className="text-content-secondary">{selectedRoute.driver}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Vehículo</label>
                        <p className="text-content-secondary">{selectedRoute.vehicleType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Distancia</label>
                        <p className="text-content-secondary">{selectedRoute.totalDistance} km</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Duración</label>
                        <p className="text-content-secondary">{selectedRoute.estimatedDuration}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Combustible</label>
                        <p className="text-content-secondary">${selectedRoute.fuelCost}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Entregas Programadas</label>
                      <div className="space-y-2">
                        {selectedRoute.orders.map((order) => (
                          <div key={order.orderId} className="p-2 surface-secondary rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{order.customerName}</p>
                                <p className="text-xs text-content-secondary">{order.address}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{order.estimatedTime}</p>
                                <Badge className={order.priority === 'express' ? 'badge-warning' : 'badge-default'}>
                                  {order.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Optimizar Nueva Ruta</h2>
                  <div className="space-y-4">
                    <Input
                      type="date"
                      placeholder="Fecha de entrega"
                      value={newRouteOptimization.deliveryDate}
                      onChange={(e) => setNewRouteOptimization({...newRouteOptimization, deliveryDate: e.target.value})}
                    />
                    <Input
                      placeholder="Región"
                      value={newRouteOptimization.region}
                      onChange={(e) => setNewRouteOptimization({...newRouteOptimization, region: e.target.value})}
                    />
                    <select
                      value={newRouteOptimization.vehicleType}
                      onChange={(e) => setNewRouteOptimization({...newRouteOptimization, vehicleType: e.target.value as 'moto' | 'auto' | 'camion'})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="moto">Motocicleta</option>
                      <option value="auto">Automóvil</option>
                      <option value="camion">Camión</option>
                    </select>
                    <select
                      value={newRouteOptimization.priority}
                      onChange={(e) => setNewRouteOptimization({...newRouteOptimization, priority: e.target.value as 'standard' | 'express' | 'urgent'})}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    >
                      <option value="standard">Estándar</option>
                      <option value="express">Express</option>
                      <option value="urgent">Urgente</option>
                    </select>
                    <div className="flex gap-2">
                      <Button onClick={optimizeRoute}>Optimizar Ruta</Button>
                      <Button variant="outline" onClick={() => setSelectedRoute(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-content-tertiary">
                Selecciona una ruta o crea una nueva optimización
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Devoluciones */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Solicitudes de Devolución</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredReturns.map((returnReq) => (
                <div
                  key={returnReq.id}
                  className={`p-3 border rounded-lg cursor-pointer surface-hover ${
                    selectedReturn?.id === returnReq.id ? 'border-primary bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedReturn(returnReq)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{returnReq.id} - {returnReq.orderId}</h3>
                      <p className="text-sm text-content-secondary">{returnReq.customerEmail}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={returnStatusColors[returnReq.status]}>
                          {returnReq.status}
                        </Badge>
                        <span className="text-sm">{returnReq.returnType}</span>
                        <span className="text-sm">{returnReq.items.length} items</span>
                      </div>
                    </div>
                    <span className="text-xs text-content-tertiary">
                      {new Date(returnReq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detalle de Devolución */}
          <Card className="p-4">
            {selectedReturn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{selectedReturn.id}</h2>
                  <div className="flex gap-2">
                    <Badge className={returnStatusColors[selectedReturn.status]}>
                      {selectedReturn.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Orden Original</label>
                      <p className="text-content-secondary">{selectedReturn.orderId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cliente</label>
                      <p className="text-content-secondary">{selectedReturn.customerEmail}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Devolución</label>
                    <p className="text-content-secondary">{selectedReturn.returnType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Items a Devolver</label>
                    <div className="space-y-2">
                      {selectedReturn.items.map((item) => (
                        <div key={item.productId} className="p-2 surface-secondary rounded">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-sm">{item.productName}</p>
                              <p className="text-xs text-content-secondary">ID: {item.productId}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Cantidad: {item.quantity}</p>
                              <p className="text-xs text-content-secondary">Razón: {item.reason}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Razón del Cliente</label>
                    <p className="text-content-secondary text-sm">{selectedReturn.customerReason}</p>
                  </div>
                  {selectedReturn.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Notas del Administrador</label>
                      <p className="text-content-secondary text-sm">{selectedReturn.adminNotes}</p>
                    </div>
                  )}
                  {selectedReturn.refundAmount !== undefined && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Monto de Reembolso</label>
                      <p className="text-content-secondary">${selectedReturn.refundAmount}</p>
                    </div>
                  )}
                </div>
                {selectedReturn.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => updateReturnStatus(selectedReturn.id, 'approved', 'Aprobada por administrador')}
                      className="badge-success"
                    >
                      Aprobar
                    </Button>
                    <Button 
                      onClick={() => updateReturnStatus(selectedReturn.id, 'rejected', 'Rechazada - no cumple criterios')}
                      variant="destructive"
                    >
                      Rechazar
                    </Button>
                  </div>
                )}
                {selectedReturn.status === 'approved' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => updateReturnStatus(selectedReturn.id, 'processing', 'En proceso de devolución')}
                    >
                      Procesar
                    </Button>
                  </div>
                )}
                {selectedReturn.status === 'processing' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => updateReturnStatus(selectedReturn.id, 'completed', 'Devolución completada')}
                      className="badge-success"
                    >
                      Completar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-content-tertiary">
                Selecciona una solicitud de devolución para ver los detalles
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default LogisticsPage;