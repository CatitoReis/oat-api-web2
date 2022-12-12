export default app => {

  const { Project } = app.app.models.Project
  const { Task } = app.app.models.Task

  async function createProject(req, res) {
    try {
      const { title, description, tasks } = req.body

      const project = new Project({ title, description, user: req.userId })

      await Promise.all(tasks.map(async (task) => {
        const projectTask = new Task({
          ...task,
          project: project._id,
          assignedTo: req.userId
        })

        await projectTask.save()

        project.tasks.push(projectTask)
      }))

      await project.save()

      return res.send({ project })
    } catch (err) {
      return res.status(400).send({ error: 'Error creating new project.' })
    }
  }

  // listar os projectos
  const getProject = async (req, res) => {
    try {
      const projects = await Project.find().populate(['user', 'tasks'])

      return res.send({ projects })
    } catch(err) {
      return res.status(400).send({ error: 'Error loading projects.' })
    }
  }


  const getProjectById = async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectId).populate(['user', 'tasks'])

      return res.send({ project })
    } catch(err) {
      return res.status(400).send({ error: 'Error loading project.'})
    }
  }

  // update dos projetos
  const updateProject = async (req, res) => {
    try {
      const { title, description, tasks } = req.body
      
      const project = await Project.findByIdAndUpdate(req.params.projectId, { 
        title, 
        description
      }, { new: true })

      project.tasks = []
      await Task.remove({ project: project._id })

      await Promise.all(tasks.map(async task => {
        const projectTask = new Task({ 
          ...task, 
          project: project._id, 
          assignedTo: req.userId 
        })

        await projectTask.save()

        project.tasks.push(projectTask)
      }))

      await project.save()

      return res.send({ project })
    } catch(err) {
      return res.status(400).send({ error: 'Error updating project.' })
    }
  }

  // deletar os projetos
  const removeProject = async (req, res) => {
    try {
      await Project.findByIdAndRemove(req.params.projectId)

      return res.status(200).send({ message: 'Project successfully removed!' })
    } catch(err) {
      return res.status(400).send({ error: 'Error loading project.'})
    }
  }

  return { createProject, getProject, getProjectById, removeProject, updateProject }
}