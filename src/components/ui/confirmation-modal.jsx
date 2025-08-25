import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { Button } from './button'
import { useState } from 'react'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className={`${modalStyle.bgColor} ${modalStyle.borderColor} border-b px-6 py-4 rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 ${modalStyle.iconColor}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-gray-700 whitespace-pre-line">{message}</div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          {showCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="btn-secondary"
            >
              {cancelText}
            </Button>
          )}
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            className={type === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
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
