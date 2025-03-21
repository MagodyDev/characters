import React, { useState, ChangeEvent, FormEvent } from 'react';
import './App.css';

interface Character {
  realName: string;
  characterName: string;
  race: string;
  profession: string;
  workStatus: string;
  image: File | null;
  lore: string;
  skills: {
    Negociación: number;
    'Cap. de Aprendizaje': number;
    Eficiencia: number;
    Inteligencia: number;
  };
}

interface FormErrors {
  realName?: string;
  characterName?: string;
  lore?: string;
  image?: string;
}

function App() {
  const [character, setCharacter] = useState<Character>({
    realName: '',
    characterName: '',
    race: 'Orco',
    profession: 'Programador',
    workStatus: 'Estudiante',
    image: null,
    lore: '',
    skills: {
      'Negociación': 1,
      'Cap. de Aprendizaje': 1,
      'Eficiencia': 1,
      'Inteligencia': 1,
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const races = ['Orco', 'Mago', 'Guerrero', 'Humano', 'Furtivo', 'Fantasma'];
  const professions = ['Programador', 'Vendedor', 'Automatizaciones'];
  const workStatuses = ['Estudiante', 'Desempleado', 'Empleado', 'Empleador', 'Freelancer'];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!character.realName.trim()) {
      newErrors.realName = 'El nombre real es requerido';
    }

    if (!character.characterName.trim()) {
      newErrors.characterName = 'El nombre del personaje es requerido';
    }

    if (!character.lore.trim()) {
      newErrors.lore = 'La historia del personaje es requerida';
    } else if (character.lore.length < 50) {
      newErrors.lore = 'La historia debe tener al menos 50 caracteres';
    } else if (character.lore.length > 2000) {
      newErrors.lore = 'La historia no puede exceder los 2000 caracteres';
    }

    if (!character.image) {
      newErrors.image = 'La imagen del personaje es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCharacter(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCharacter(prev => ({
        ...prev,
        image: e.target.files![0],
      }));
      // Clear image error if it exists
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: undefined,
        }));
      }
    }
  };

  const handleSkillChange = (skillName: keyof typeof character.skills, value: number) => {
    setCharacter(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillName]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus('');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(character).forEach(([key, value]) => {
        if (key === 'skills') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'image' && value) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await fetch('https://n8n.effycentai.com/webhook/characters', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        alert('¡Personaje guardado exitosamente!');
        // Optional: Reset form after successful submission
        setCharacter({
          realName: '',
          characterName: '',
          race: 'Orco',
          profession: 'Programador',
          workStatus: 'Estudiante',
          image: null,
          lore: '',
          skills: {
            'Negociación': 1,
            'Cap. de Aprendizaje': 1,
            'Eficiencia': 1,
            'Inteligencia': 1,
          },
        });
      } else {
        const errorData = await response.text();
        throw new Error(`Error del servidor: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      alert(`Error al guardar el personaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Ficha de Personaje
          <span className="block text-3xl mt-2">Effycent</span>
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">Nombre Real:</label>
            <input
              type="text"
              name="realName"
              value={character.realName}
              onChange={handleInputChange}
              className={`w-full bg-gray-700 text-white p-2 rounded border ${
                errors.realName ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
            />
            {errors.realName && (
              <p className="text-red-500 text-sm mt-1">{errors.realName}</p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Nombre del Personaje:</label>
            <input
              type="text"
              name="characterName"
              value={character.characterName}
              onChange={handleInputChange}
              className={`w-full bg-gray-700 text-white p-2 rounded border ${
                errors.characterName ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
            />
            {errors.characterName && (
              <p className="text-red-500 text-sm mt-1">{errors.characterName}</p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Raza/Clase:</label>
            <select
              name="race"
              value={character.race}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {races.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Profesión:</label>
            <select
              name="profession"
              value={character.profession}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {professions.map(profession => (
                <option key={profession} value={profession}>{profession}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Estado Laboral:</label>
            <select
              name="workStatus"
              value={character.workStatus}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {workStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-2">Sube la imagen de tu personaje:</label>
            <p className="text-sm text-gray-400 mb-2">Nota: Es mejor generarla con IA para tener tu propio personaje.</p>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className={`w-full text-white ${errors.image ? 'border-red-500' : ''}`}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image}</p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2">Lore (Historia):</label>
            <textarea
              name="lore"
              value={character.lore}
              onChange={handleInputChange}
              placeholder="Cuenta los orígenes, motivaciones y rasgos de tu personaje (50 - 2000 caracteres)"
              className={`w-full bg-gray-700 text-white p-2 rounded border ${
                errors.lore ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-32`}
            />
            {errors.lore && (
              <p className="text-red-500 text-sm mt-1">{errors.lore}</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">ÁRBOL DE HABILIDADES</h2>
            
            {Object.entries(character.skills).map(([skill, value]) => (
              <div key={skill} className="flex items-center gap-4">
                <span className="text-white w-32">{skill}:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) => handleSkillChange(skill as keyof typeof character.skills, parseInt(e.target.value))}
                  className="flex-1 skill-slider"
                />
                <span className="text-white w-16">{value} /10</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full font-bold py-3 px-4 rounded transition-colors ${
              isSubmitting
                ? 'bg-gray-600 cursor-not-allowed'
                : submitStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : submitStatus === 'success'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar personaje'}
          </button>

          {submitStatus === 'error' && (
            <p className="text-red-500 text-center mt-2">
              Por favor, corrige los errores antes de guardar.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default App;