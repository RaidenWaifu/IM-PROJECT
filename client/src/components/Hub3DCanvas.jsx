import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hub3DCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#17272d')

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    camera.position.set(8, 7, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 1.5))

    const sunlight = new THREE.DirectionalLight(0xffffff, 2)
    sunlight.position.set(5, 10, 7)
    scene.add(sunlight)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 12),
      new THREE.MeshStandardMaterial({
        color: '#243b40',
        roughness: 0.9,
      })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.05
    scene.add(ground)

    const grid = new THREE.GridHelper(16, 16, '#567078', '#354c52')
    grid.position.y = 0
    scene.add(grid)

    function createVehicle(x, z, color) {
      const group = new THREE.Group()

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.7, 1),
        new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
      )
      body.position.y = 0.65
      group.add(body)

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.65, 0.9),
        new THREE.MeshStandardMaterial({ color: '#d8e1df' })
      )
      cabin.position.set(-0.45, 1.3, 0)
      group.add(cabin)

      const wheelMaterial = new THREE.MeshStandardMaterial({
        color: '#101719',
        roughness: 1,
      })

      for (const wheelX of [-0.6, 0.65]) {
        for (const wheelZ of [-0.52, 0.52]) {
          const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.15, 20),
            wheelMaterial
          )
          wheel.rotation.x = Math.PI / 2
          wheel.position.set(wheelX, 0.28, wheelZ)
          group.add(wheel)
        }
      }

      group.position.set(x, 0, z)
      scene.add(group)
    }

    createVehicle(-3, -1, '#d6a34d')
    createVehicle(0, -1, '#70a9a0')
    createVehicle(3, -1, '#c77c68')
    createVehicle(-1.5, 2, '#8c9eaa')
    createVehicle(2, 2, '#d6a34d')

    let animationId

    function animate() {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    function resize() {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(animationId)
      observer.disconnect()
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="hub-3d-canvas" />
}
