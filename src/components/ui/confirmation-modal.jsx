import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from './button'
import { useState } from 'react'
import { useMobile } from '@/hooks/useMobile'

const modalTypes = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
}

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'info',
  showCancel = true,
  confirmButtonVariant = 'default'
}) {
  const { isMobile } = useMobile()
  
  if (!isOpen) return null

  const modalStyle = modalTypes[type] || modalTypes.info
  const Icon = modalStyle.icon

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobile ? 'p-4' : ''}`}>
      <div className={`bg-white shadow-xl w-full transform transition-all ${
        isMobile ? 'rounded-xl max-w-sm' : 'rounded-lg max-w-md mx-4'
      }`}>
        {/* Header */}
        <div className={`${modalStyle.bgColor} ${modalStyle.borderColor} border-b ${isMobile ? 'px-4 py-3' : 'px-6 py-4'} rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <Icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${modalStyle.iconColor}`} />
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
          <div className={`text-gray-700 whitespace-pre-line ${isMobile ? 'text-sm' : ''}`}>{message}</div>
        </div>

        {/* Actions */}
        <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} bg-gray-50 rounded-b-lg flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-3'}`}>
          {showCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className={`btn-secondary ${isMobile ? 'w-full' : ''}`}
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            className={`${type === 'error' ? 'bg-red-600 hover:bg-red-700' : ''} ${isMobile ? 'w-full' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function useConfirmationModal() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'info',
    showCancel: true,
    confirmButtonVariant: 'default',
    onConfirm: () => {}
  })

  const openModal = (config) => {
    setModalState({
      isOpen: true,
      title: config.title || 'Confirmar Acción',
      message: config.message || '¿Está seguro de que desea continuar?',
      confirmText: config.confirmText || 'Confirmar',
      cancelText: config.cancelText || 'Cancelar',
      type: config.type || 'info',
      showCancel: config.showCancel !== false,
      confirmButtonVariant: config.confirmButtonVariant || 'default',
      onConfirm: config.onConfirm || (() => {})
    })
  }

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const confirm = (config) => {
    return new Promise((resolve) => {
      openModal({
        ...config,
        onConfirm: () => {
          if (config.onConfirm) {
            config.onConfirm()
          }
          resolve(true)
        }
      })
    })
  }

  return {
    modalState,
    openModal,
    closeModal,
    confirm
  }
}
